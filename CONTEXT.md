# Especialista do Ar

Base estruturada de aparelhos de ar-condicionado construída a partir da exportação oficial de produtos do INMETRO. É consumida por agentes de IA e por um site, e existe para que ninguém precise interpretar a exportação bruta.

## Language

**Agente (consumidor)**:
Um leitor externo da base — uma ferramenta de IA, um programa ou uma pessoa — que consulta os Aparelhos e Registros. Não é parte do site: é quem consome a base, hoje os arquivos JSON estáticos publicados.
_Avoid_: Bot, robô (sugere que roda dentro do produto)

**Linha da tabela**:
Uma linha da exportação oficial do INMETRO (o CSV), preservada exatamente como foi publicada, junto com a Versão da tabela de onde veio.
_Avoid_: Registro, entrada, produto

**Registro INMETRO**:
A inscrição oficial identificada pelo Número do Registro, com status próprio (Ativo, Cancelado ou Inativo), que abrange uma ou mais Linhas da tabela.
_Avoid_: Processo, inscrição

**Aparelho**:
Um kit de ar-condicionado identificado por marca, modelo da unidade interna e modelo da unidade externa — usando o campo Modelo quando as unidades não vêm separadas. Aponta para uma ou mais Linhas da tabela e Registros INMETRO. Cada marca é um Aparelho distinto, mesmo quando várias marcas compartilham o mesmo Registro. Tensão não faz parte da identidade: um Aparelho bivolt é um só, com mais de uma tensão.
_Avoid_: Produto, modelo (ambíguo: pode designar só a unidade interna)

**Marca de catálogo**:
Agrupamento editorial de Marcas oficiais sob o nome que as pessoas procuram — por exemplo, MIDEA reúne MIDEA e SPRINGER MIDEA, e FUJITSU reúne FUJITSU/AIRSTAGE e AIRSTAGE. Vive na camada curada e só no dataset de consulta: a Marca oficial da base servida e da ficha não muda, e o `id` do Aparelho também não.
_Avoid_: Marca normalizada, marca corrigida (não é correção: é agrupamento)

**Variante**:
Uma combinação de tensão e Dados declarados de um Aparelho, com as Linhas da tabela que a produziram. Como a tensão não faz parte da identidade, um Aparelho bivolt tem mais de uma Variante. Capacidades divergentes sob a mesma tensão viram Variantes distintas — nada é descartado em silêncio.
_Avoid_: Versão (colide com Versão da tabela), configuração

**Aparelho sem dados declarados**:
Um Aparelho presente na tabela que não traz Dados declarados. É um estado, não um tipo distinto de Aparelho: a base servida só descarta o que não tem Dados declarados, mas o Aparelho continua existindo para o histórico.
_Avoid_: Produto incompleto, registro vazio

**Oferta**:
Um link comercial de afiliado para um Aparelho, exibido apenas no site e nunca misturado aos dados técnicos. É sempre identificada na tela como link de afiliado.
_Avoid_: Link de compra, anúncio

**Análise**:
Texto editorial sobre um único Aparelho, publicado no site numa seção própria e separado dos dados técnicos. Pode trazer números próprios, que não são Valores oficiais; a ficha do Aparelho continua sendo a fonte oficial.
_Avoid_: Artigo, review, resenha

**Aparelho analisado**:
Aparelho que tem uma Análise publicada. Na tabela de Aparelhos, ganha o selo "Análise" — etiqueta de contorno, com link para a Análise e tooltip com o título dela — dentro da célula da Marca, ao lado do valor, e a linha destacada, **na posição que a ordenação escolhida lhe der**: a tabela não promove os analisados para o topo. O selo existe só para aparelhos com Análise publicada; não é uma coluna de dados nem ocupa célula própria, então a grande maioria das linhas fica sem ele. É derivado da Análise, no build do site: a base servida e o dataset de consulta nunca carregam essa marca. Acima da tabela, fora dela e com cartões próprios, a vitrine **"Aparelhos com análise"** é sempre renderizada quando há ao menos uma Análise publicada, mesmo sem analisado no recorte ativo (inclusive o padrão de Tensão 220 V). Mostra até **6** cartões: primeiro os analisados que passam no recorte — as capacidades mais compradas (9.000, 12.000 e 18.000 BTU/h) abrem a lista e as demais completam, na ordem das Análises, da mais recente para a mais antiga —; depois os **Aparelhos similares** completam as vagas. Cada item mostra a Marca, o **título da Análise** (não o modelo), a capacidade e o Tipo. Os cartões repetem aparelhos que também aparecem, destacados, na tabela; o bloco não altera contagem, ordenação nem paginação. Quando só há similares, uma legenda explica que os cartões estão fora do recorte e, se houver filtro de Marca, cita a marca filtrada. A tabela não exibe aviso de afiliado: o aviso de transparência fica no topo da Análise e em cada Oferta.
_Avoid_: Recomendado, indicado, patrocinado, destaque (prometem uma garantia de qualidade ou escondem a relação comercial); selo "Analisado" (nome antigo)

**Aparelho similar**:
Aparelho analisado que **não** passa no recorte ativo da tabela, mas é oferecido na vitrine "Aparelhos com análise" como alternativa, preenchendo as vagas que os analisados compatíveis deixaram. A ordem é: capacidade — correspondência exata com o BTU do recorte, depois capacidade presente no conjunto filtrado, depois a menor distância relativa —; Marca de catálogo conhecida; atributos em comum com o recorte (Tipo, Função, Classe, Tensão); e recência da Análise. Num recorte vazio (nada passa nos filtros) não há alvo de capacidade e esse critério é pulado. Não é uma recomendação de compra.
_Avoid_: Recomendado, melhor opção, substituto

**Comparação**:
A seleção de até **3** Aparelhos e a matriz neutra de atributos que os confronta — Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS e Classe, como faixa quando o Aparelho tem mais de uma Variante. Vive em `/comparar/` e é endereçável por `?ids=id1,id2,id3`, com a ordem escolhida, no **mesmo contrato** da tabela; a chave é estado de interface, separada de `FiltrosConsulta`, e a página publica canonical sem ela. Nenhum valor é destacado como melhor: a leitura editorial fica nas Análises (ADR-0021).
_Avoid_: Ranking, ranking de aparelhos, cesta (sugerem ordem ou recomendação)

**Assistente**:
O configurador determinístico do site (`/assistente/`) que traduz cinco perguntas sobre o ambiente — tipo de ambiente, área, incidência de sol, pessoas e equipamentos/lâmpadas/janelas — numa capacidade comercial de ar-condicionado. Não usa IA em runtime, LLM nem Worker: a inteligência está na árvore de perguntas e nos coeficientes fixos e auditáveis. O estado inteiro vive na URL, então o resultado é compartilhável.
_Avoid_: Chat, robô, calculadora de carga térmica (não é cálculo de engenharia)

**Recomendação do Assistente**:
O resultado do Assistente: uma capacidade comercial (9.000 a 60.000 BTU/h), os fatores usados, o nível de confiança e orientações. É sempre um **Valor calculado** por uma heurística de mercado, nunca um Valor oficial do INMETRO nem promessa de economia; acima de 60.000 BTU/h indica mais de uma unidade e avaliação técnica.
_Avoid_: Resultado oficial, dimensionamento definitivo, recomendação de compra

**Guia**:
Texto editorial sobre uma escolha que envolve vários Aparelhos — uma potência, um perfil de uso —, apontando para as Análises e fichas de cada um.
_Ainda não implementado: nenhum Guia existe no site; o formato entra numa fase futura._
_Avoid_: Artigo, ranking, lista

**Filtros padrão (ticket 38, revisto no 44)**:
O recorte aplicado implicitamente quando `/aparelhos/` é aberto sem querystring — só a Tensão `220` V. É o `FILTROS_PADRAO` de `apps/site/src/lib/estado.ts`: aplicado na leitura (`lerEstado`) mas nunca escrito na URL, a menos que o estado diferente do padrão já contenha esse valor. Um link com qualquer chave de filtro é respeitado e não recebe o padrão por cima; desligar o padrão grava a chave vazia (`tensao=`). "Limpar filtros" volta ao padrão preservando a ordenação.
_Avoid_: Filtros iniciais, recorte fixo (o padrão é implícito e compartilhável, não um parâmetro da URL)

**IDRS**:
Índice de Desempenho de Refrigeração Sazonal: a razão entre o calor removido e a energia elétrica consumida (Wh/Wh) que o INMETRO declara para uma Variante. É sempre o Valor oficial e nunca é recalculado a partir da Classe. A exportação às vezes perde a vírgula decimal; a regra de formato a recoloca após o primeiro dígito (`55` → `5,5`) — é formato, não Exceção manual.
_Avoid_: Eficiência, COP, nota (são conceitos diferentes)

**Classe**:
Faixa de classificação de eficiência (A a F) que o INMETRO declara para uma Linha da tabela, lida da coluna oficial "Faixa de Classificação". É sempre o valor oficial: nunca é recalculada a partir do IDRS, porque classe e IDRS não andam juntos entre tipos de aparelho.
_Avoid_: Nota, faixa, selo

**Situação**:
Estado de um Aparelho: **Ativo** quando ao menos um dos seus Registros INMETRO está Ativo; caso contrário, não está ativo. É derivada dos status dos Registros, não um dado novo; desde o ticket 31 não é publicada como campo — quem precisa dela deriva dos `registros` do Aparelho.
_Avoid_: Status (é o nome da coluna do Registro, não do Aparelho)

**Anomalia**:
Sinal de que uma Linha da tabela traz um valor suspeito ou fora do padrão — por exemplo, um campo que deveria ser numérico e vem com texto, ou um número válido mas implausível para a coluna (capacidade nominal abaixo de 6.000 BTU/h, consumo fora de 10–120 kWh por 1.000 BTU/h, IDRS acima de 10 Wh/Wh). O valor original é preservado e a Anomalia fica visível junto ao Aparelho, para quem consulta decidir como tratá-la.
_Avoid_: Erro, defeito (não temos como saber se o dado está de fato errado)

**Exceção manual**:
Correção de conteúdo feita à mão sobre um dado de uma Linha da tabela, sempre com motivo e fonte registrados. É a única forma de alterar conteúdo; diferenças apenas de formato são padronizadas por regra, não por exceção.
_Avoid_: Ajuste, correção

**Ausente**:
Estado de um Aparelho que constava em uma versão anterior da tabela e não aparece em nenhuma Linha da versão atual. Não cobre o caso de um Aparelho que continua na tabela mas perdeu os Dados declarados — esse segue sendo um Aparelho sem dados declarados, e o histórico registra que ele já teve dados. A causa da ausência não é presumida: a tabela não diz se o modelo foi descontinuado, cancelado ou omitido por engano.
_Avoid_: Removido, cancelado, descontinuado

**Versão da tabela**:
Uma exportação da lista oficial de produtos do INMETRO (o CSV), identificada pelo seu próprio conteúdo e pela data em que foi obtida. O carimbo de data escrito no cabeçalho é apenas um rótulo, não a identidade. Cada exportação nova é uma Versão da tabela.
_Avoid_: Edição, atualização

**Vínculo sugerido**:
Indicação de que um Aparelho novo pode ser, na verdade, um Aparelho Ausente com o texto do modelo corrigido — mesma marca, mesmo Registro INMETRO e os mesmos Dados declarados e tensão. Nunca é aplicado automaticamente: precisa de confirmação de uma pessoa.
_Avoid_: Fusão, correspondência automática

**Vínculo confirmado**:
Um Vínculo sugerido que uma pessoa aprovou. Passa a valer como identidade do Aparelho, guardando o par sugerido e quem confirmou.
_Avoid_: Fusão aplicada, merge

**Valor oficial**:
Dado que veio da tabela do INMETRO, depois apenas das regras de padronização de formato. É o que se pode citar como dado do INMETRO.
_Avoid_: Valor original (o original é o que o Registro INMETRO guarda, sem padronização)

**Valor calculado**:
Dado derivado por conta determinística a partir de Valores oficiais e de entradas informadas por quem consulta, como o custo anual estimado com uma tarifa dada na consulta. Sempre acompanha a fórmula e as entradas usadas, para nunca ser confundido com um Valor oficial.
_Avoid_: Estimativa, recomendação

**Dados declarados**:
Valores de capacidade e consumo informados para quatro condições (carga total e
parcial, a 35 °C e a 29 °C), a partir dos quais o IDRS é calculado. É a camada mais
detalhada de cada Linha da tabela. A **Classe** é guardada junto deles, por
Linha/Variante, embora não seja capacidade nem consumo (ADR-0018).
_Avoid_: Dados de ensaio, dados medidos (a própria tabela os chama de declarados)
**Relatório de revisão**:
Resumo gerado a cada nova Versão da tabela, antes de qualquer publicação: Aparelhos novos, alterados e Ausentes, Anomalias novas e Vínculos sugeridos. A nova versão só vai ao ar depois que uma pessoa o revisa e aprova.
_Avoid_: Log de importação, diff

**Relatório de links quebrados**:
O resultado da verificação **manual** das Ofertas (`pnpm verificar-links`), impresso no terminal, com URL, loja e motivo de cada link que deixou de responder. É onde se vê qual link quebrou; não há job agendado, e-mail, PR nem issue.
_Avoid_: Alerta de link, monitor de links
