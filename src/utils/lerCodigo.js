// Interpretação do conteúdo lido pela câmera.
//
// O backend não codifica um id cru no QR: ele monta um texto com campos
// separados por "|" (ver materialService.obterQRCode e
// esterilizacaoService.criarPacote):
//
//   material → "material:2|codigo_barras:789123|nome:Seringa Carpule"
//   pacote   → "ciclo:5|material:2|validade:2026-12-01|gerado:2026-08-06T..."
//
// Os leitores mandavam esse texto inteiro como termo de busca
// (GET /materiais?busca=<texto todo>), o que obviamente nunca casava com
// nome nem com código de barras — daí "nada acontece ao ler o QR".
//
// Já o código de barras impresso na embalagem vem cru mesmo ("7891234567890"),
// então precisa ser tratado como caso separado.

// Transforma "a:1|b:2" em { a: '1', b: '2' }. Devolve null se não for
// esse formato (ex.: código de barras puro).
export function parsearPayload(texto) {
  if (typeof texto !== 'string' || !texto.includes(':')) return null;

  const campos = {};
  texto.split('|').forEach((parte) => {
    const separador = parte.indexOf(':');
    if (separador === -1) return;
    const chave = parte.slice(0, separador).trim();
    const valor = parte.slice(separador + 1).trim();
    if (chave) campos[chave] = valor;
  });

  return Object.keys(campos).length ? campos : null;
}

// Classifica o que foi lido para a tela saber o que fazer.
//
// Retorna um de:
//   { tipo: 'pacote',   cicloId, materialId, validade }
//   { tipo: 'material', materialId, codigoBarras, nome }
//   { tipo: 'codigo',   valor }            ← código de barras/numérico cru
export function interpretarLeitura(texto) {
  const bruto = String(texto || '').trim();
  if (!bruto) return { tipo: 'codigo', valor: '' };

  const campos = parsearPayload(bruto);

  if (campos) {
    // Pacote do CME: tem "ciclo" no payload.
    if (campos.ciclo) {
      return {
        tipo: 'pacote',
        cicloId: Number(campos.ciclo) || null,
        materialId: Number(campos.material) || null,
        validade: campos.validade && campos.validade !== 'N/A' ? campos.validade : null,
        bruto,
      };
    }

    if (campos.material) {
      return {
        tipo: 'material',
        materialId: Number(campos.material) || null,
        codigoBarras: campos.codigo_barras || null,
        nome: campos.nome || null,
        bruto,
      };
    }
  }

  // Sem "|" nem "chave:valor" — é o código impresso na embalagem.
  return { tipo: 'codigo', valor: bruto, bruto };
}

// Busca o material correspondente ao que foi lido.
// `api` é injetado para este utilitário não depender do módulo de serviço.
export async function buscarMaterialPorLeitura(api, texto) {
  const leitura = interpretarLeitura(texto);

  // QR do próprio sistema: já traz o id, então vai direto.
  if (leitura.tipo === 'material' && leitura.materialId) {
    try {
      const { data } = await api.get(`/materiais/${leitura.materialId}`);
      return { material: data, leitura };
    } catch {
      // Material pode ter sido excluído depois de a etiqueta ser impressa;
      // ainda tentamos pelo código de barras abaixo.
    }
  }

  const codigo = leitura.tipo === 'codigo'
    ? leitura.valor
    : (leitura.codigoBarras || '');

  if (!codigo) return { material: null, leitura };

  const { data } = await api.get('/materiais', { params: { busca: codigo } });
  const lista = Array.isArray(data) ? data : [];

  // Exige correspondência exata do código de barras. Antes havia um
  // "|| data[0]" aqui, que abria um material qualquer quando o código não
  // batia — pior do que não encontrar, porque parecia ter dado certo.
  const exato = lista.find((m) => String(m.codigo_barras || '').trim() === codigo.trim());
  return { material: exato || null, leitura };
}
