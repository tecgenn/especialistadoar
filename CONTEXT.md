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
Um link comercial de afiliado para um Aparelho, exibido apenas no site e nunca misturado aos dados técnicos.
_Avoid_: Link de compra, anúncio

**Análise**:
Texto editorial sobre um único Aparelho, publicado no site numa seção própria e separado dos dados técnicos. Pode trazer números próprios, que não são Valores oficiais; a ficha do Aparelho continua sendo a fonte oficial.
_Avoid_: Artigo, review, resenha

**Guia**:
Texto editorial sobre uma escolha que envolve vários Aparelhos — uma potência, um perfil de uso —, apontando para as Análises e fichas de cada um.
_Avoid_: Artigo, ranking, lista

**Anomalia**:
Sinal de que uma Linha da tabela traz um valor suspeito ou fora do padrão — por exemplo, um campo que deveria ser numérico e vem com texto, ou um número válido mas implausível para a coluna (capacidade nominal abaixo de 6.000 BTU/h). O valor original é preservado e a Anomalia fica visível junto ao Aparelho, para quem consulta decidir como tratá-la.
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
Valores de capacidade e consumo informados para quatro condições (carga total e parcial, a 35 °C e a 29 °C), a partir dos quais o IDRS é calculado. É a camada mais detalhada de cada Linha da tabela.
_Avoid_: Dados de ensaio, dados medidos (a própria tabela os chama de declarados)

**Relatório de revisão**:
Resumo gerado a cada nova Versão da tabela, antes de qualquer publicação: Aparelhos novos, alterados e Ausentes, Anomalias novas e Vínculos sugeridos. A nova versão só vai ao ar depois que uma pessoa o revisa e aprova.
_Avoid_: Log de importação, diff

**Relatório de links quebrados**:
O resultado da verificação **manual** das Ofertas (`pnpm verificar-links`), impresso no terminal, com URL, loja e motivo de cada link que deixou de responder. É onde se vê qual link quebrou; não há job agendado, e-mail, PR nem issue.
_Avoid_: Alerta de link, monitor de links
