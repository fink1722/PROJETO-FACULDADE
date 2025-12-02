Documento de Design de Projeto (PDD)

Central do Mentor
Versão: 1.1.0 
Data: 30 de Agosto de 2025 

Autores: Lucas Jardim Rocha, Rafael Silva Abreu, Cauã Evaristo da Cruz

Sumário Executivo
O presente documento detalha a concepção, o escopo, os requisitos e a estratégia de desenvolvimento da plataforma web "Central do Mentor". O projeto visa criar uma ponte entre estudantes e profissionais experientes através de sessões de mentoria abertas e em grupo. Este PDD servirá como guia mestre para todas as fases do projeto.

1. Visão Geral do Projeto
1.1. Missão, Visão e Valores (MVV)
Missão: Democratizar o acesso à mentoria de carreira, conectando a próxima geração de profissionais ao conhecimento prático de mentores experientes por meio de sessões abertas e colaborativas.
Visão: Ser a principal plataforma de conexão para mentoria voluntária no estado do Tocantins, reconhecida por seu impacto real no desenvolvimento profissional de jovens e na valorização do legado de profissionais experientes.
Valores: Colaboração, Legado, Acessibilidade, Confiança, Impacto.

1.2. O Problema
Existe uma lacuna sistêmica entre o conhecimento teórico adquirido por estudantes e a sabedoria prática exigida pelo mercado. Profissionais experientes detêm um vasto conhecimento que permanece, em grande parte, inacessível, enquanto estudantes enfrentam incertezas sobre carreira sem uma orientação direcionada e em um ambiente de aprendizado coletivo.

1.3. A Solução Proposta
A "Central do Mentor" é uma plataforma web onde Mentores podem agendar e anunciar sessões de mentoria online, abertas e em grupo. Os estudantes (Aprendizes) podem explorar os temas das próximas sessões, inscrever-se para participar e interagir em um ambiente de aprendizado coletivo. A plataforma gerencia a divulgação dos eventos, a participação e o feedback, tornando o processo dinâmico e escalável.


2. Escopo do Projeto
2.1. Público-Alvo
Perfil 1: Aprendiz: Estudantes que buscam orientação e aprendizado em um formato de grupo, permitindo a troca de experiências com outros participantes.
Perfil 2: Mentor: Profissionais que desejam otimizar seu tempo e impacto, compartilhando conhecimento com múltiplos estudantes simultaneamente.

2.2. Funcionalidades Essenciais (MVP v1.1.0)
Módulo de Autenticação e Perfis:
Cadastro unificado com seleção de perfil (Aprendiz/Mentor).
Login e sistema de recuperação de senha.
Criação e edição de perfil para Aprendizes e Mentores (foto, biografia, área de atuação, etc.).
(Mentor) CRUD de suas áreas de especialidade/tópicos de interesse.
Módulo de Sessões Abertas (Visão do Mentor):
Dashboard para criar e agendar uma nova "Sessão Aberta", definindo:
Título/Tema da sessão.
Breve descrição.
Data e Hora de início.
Duração pré-estipulada (recomendação de 30 min).
Link da videochamada externa (Meet, Zoom, etc.).
Visualização de suas sessões agendadas e passadas.
Visualização da lista de Aprendizes inscritos em cada sessão.
Módulo de Descoberta e Participação (Visão do Aprendiz):
Página principal com um feed/calendário de "Próximas Sessões Abertas".
Sistema de busca por tema ou nome do mentor.
Visualização dos detalhes de uma sessão (tema, mentor, data, hora, inscritos).
Funcionalidade para "Inscrever-se" em uma sessão, garantindo seu lugar e recebendo notificações.
Acesso ao link da vídeo chamada no momento da sessão.
Funcionalidade para deixar um feedback/agradecimento público sobre a sessão após sua conclusão.


2.3. Fora do Escopo (O que NÃO será feito na v1.1.0)
Sistema de vídeo chamada integrado.
Sistema de monetização ou pagamento.
Aplicativo móvel nativo.
Sistema de "matchmaking" automático.
Sessões individuais ou chat privado para agendamento. O modelo é focado em eventos públicos agendados pelo mentor.
Sistema de avaliação por notas ou estrelas.

3. Requisitos do Sistema

3.1. Requisitos Funcionais (RF)
RF-01: O sistema DEVE permitir que um novo usuário se cadastre como "Aprendiz" ou "Mentor".
RF-02: O sistema DEVE permitir que um usuário autenticado edite seu perfil.
RF-03: O sistema DEVE permitir que um Mentor crie, agende e publique uma nova Sessão Aberta.
RF-04: O sistema DEVE exigir que o agendamento seja feito com no mínimo 6 horas de antecedência.
RF-05: O sistema DEVE exibir um feed/calendário público com todas as sessões futuras agendadas.
RF-06: O sistema DEVE permitir que um Aprendiz se inscreva em uma Sessão Aberta.
RF-07: O sistema DEVE permitir que o Aprendiz visualize o link da sessão em que está inscrito.
RF-08: O sistema DEVE notificar (na plataforma) os Aprendizes inscritos sobre o início iminente da sessão.
RF-09: O sistema DEVE permitir que um Aprendiz envie um feedback textual após a conclusão de uma sessão.
RF-10: O sistema DEVE exibir os feedbacks recebidos no perfil público do Mentor.

3.2. Requisitos Não Funcionais (RNF)
RNF-01 (Desempenho): A plataforma deve carregar as principais páginas em menos de 3 segundos em uma conexão de internet banda larga padrão.
RNF-02 (Usabilidade): A interface deve ser intuitiva e responsiva, adaptando-se a desktops, tablets e smartphones.
RNF-03 (Segurança): As senhas dos usuários devem ser armazenadas de forma criptografada (hashed). A plataforma deve seguir as diretrizes básicas da LGPD.
RNF-04 (Disponibilidade): A plataforma deve visar uma disponibilidade de 99% de tempo no ar após o lançamento.
RNF-05 (Compatibilidade): A plataforma deve ser compatível com as duas últimas versões dos navegadores Google Chrome, Mozilla Firefox e Safari.

4. Fluxos de Usuário Essenciais
4.1. Fluxo: Criação de uma Sessão (Jornada do Mentor)
Entrada: Mentor faz login e acessa seu dashboard.
Ação: Clica em "Agendar Nova Sessão".
Preenchimento: Preenche o formulário: Tema ("Como montar um portfólio de UI/UX"), descrição, data, hora, duração e insere o link do Google Meet.
Confirmação: Clica em "Publicar Sessão".
Resultado: A sessão aparece publicamente no feed da plataforma e em seu painel de "Sessões Agendadas".

4.2. Fluxo: Participação em uma Sessão (Jornada do Aprendiz)
Entrada: Aprendiz acessa a página principal "Próximas Sessões".
Descoberta: Vê a sessão sobre "Portfólio de UI/UX" e se interessa.
Análise: Clica para ver os detalhes da sessão e o perfil do mentor.
Ação: Clica no botão "Inscrever-se".
Confirmação: A sessão aparece em seu painel "Minhas Sessões Inscritas".
Participação: No horário agendado, acessa seu painel e clica no link para entrar na videochamada.
Feedback: Após o término, recebe uma notificação para deixar seu feedback sobre a sessão.

5. Métricas de Sucesso (KPIs)
Engajamento do Mentor: Nº de sessões abertas criadas por semana/mês.
Engajamento do Aprendiz: Nº total de inscrições em sessões.
Core Loop: Taxa de participação (inscritos que compareceram) por sessão.
Qualidade: Taxa de envio de feedback após a conclusão das sessões.
Crescimento: Nº de novos cadastros (Aprendizes e Mentores) por mês.

