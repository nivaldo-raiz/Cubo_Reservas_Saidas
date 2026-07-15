# SUPERPROMPT — APLICAÇÃO DE ESCOLHA DE ASSENTOS
## Cubo Global School — Viagem NR English & Action

Você atuará como engenheiro de software sênior, arquiteto de soluções, product designer e especialista em segurança de aplicações educacionais.

Sua missão é planejar, construir, testar e documentar uma aplicação web completa para o **Cubo Global School**, destinada à organização antecipada dos assentos dos ônibus utilizados na viagem escolar ao programa **NR English & Action**.

Não entregue apenas wireframes, páginas estáticas ou uma demonstração visual. Desenvolva uma aplicação funcional, responsiva, segura, consistente e preparada para uso real pela escola, pelos responsáveis e pela equipe administrativa.

Use o arquivo `PRD_Cubo_NR_Seat_Selection.md` como fonte principal de requisitos de produto. Quando houver conflito entre este prompt e o PRD, priorize o PRD e registre a divergência.

---

# 1. PRINCÍPIO CENTRAL DO PRODUTO

A plataforma deverá permitir que responsáveis previamente cadastrados na base oficial do Cubo:

1. acessem o sistema por e-mail;
2. recebam um código temporário de seis dígitos;
3. validem sua identidade sem criar senha;
4. visualizem somente os alunos vinculados àquele e-mail e inscritos na viagem;
5. selecionem o aluno;
6. confirmem os dados;
7. consultem as regras;
8. escolham um assento disponível no ônibus atribuído;
9. confirmem a reserva;
10. consultem documentos e orientações;
11. registrem ciência;
12. recebam um protocolo final.

A aplicação também deverá possuir uma área administrativa para gestão da viagem, participantes, ônibus, assentos, documentos, termos, relatórios e auditoria.

---

# 2. DECISÃO DE AUTENTICAÇÃO

Não implementar login por senha no MVP.

A autenticação será **passwordless**, baseada em:

- e-mail previamente cadastrado;
- código temporário de seis dígitos;
- validade de 10 minutos;
- uso único;
- limitação de tentativas;
- limitação de reenvios;
- rate limiting por e-mail, IP e dispositivo;
- sessão temporária;
- logs de acesso;
- invalidação de códigos anteriores após novo envio.

Não permitir:

- cadastro público;
- criação espontânea de conta;
- alteração de e-mail pelo próprio usuário;
- acesso apenas por nome do aluno;
- enumeração de e-mails cadastrados;
- mensagens que revelem se determinado e-mail existe ou não na base.

Mensagem pública recomendada:

“Caso o e-mail informado esteja vinculado a uma inscrição ativa, enviaremos um código de acesso.”

Em ambiente de desenvolvimento, utilizar um provedor de e-mail simulado ou caixa de saída local. Em produção, preparar integração com provedor configurável.

---

# 3. REGRAS DE VÍNCULO RESPONSÁVEL–ALUNO

O sistema deve suportar:

- um responsável vinculado a um ou mais alunos;
- um aluno vinculado a um ou mais responsáveis;
- mais de um responsável autorizado a acessar o mesmo aluno;
- reserva pertencente ao aluno, não ao responsável;
- exibição do estado atual caso outro responsável já tenha concluído a escolha;
- histórico de quem iniciou ou alterou cada ação;
- restrição de alteração conforme prazo e regras administrativas.

Caso um e-mail não esteja corretamente cadastrado, a correção deverá ser feita somente pela equipe do Cubo.

---

# 4. PERFIS DE ACESSO

## 4.1. Responsável

Pode:

- autenticar-se por código temporário;
- visualizar alunos vinculados;
- acessar apenas alunos inscritos em viagens disponíveis;
- confirmar dados cadastrais;
- solicitar correção de dados;
- visualizar o ônibus do aluno;
- escolher assento disponível;
- alterar a escolha enquanto permitido;
- consultar orientações e documentos;
- registrar ciência;
- visualizar ou imprimir comprovante.

Não pode:

- visualizar dados de outros alunos;
- visualizar nomes de ocupantes de outros assentos;
- escolher assento de outro ônibus;
- editar dados cadastrais críticos;
- alterar configurações da viagem;
- ignorar prazo ou bloqueios administrativos.

## 4.2. Administrador

Pode:

- criar e editar viagens;
- cadastrar ônibus;
- configurar layouts;
- importar participantes e responsáveis;
- definir vínculos entre responsáveis e alunos;
- alocar alunos em ônibus;
- bloquear assentos;
- reservar assentos para equipe;
- realocar participantes;
- definir prazos;
- configurar regras;
- configurar requisitos documentais;
- criar versões do termo de ciência;
- acompanhar status;
- exportar relatórios;
- gerar acessos de contingência;
- consultar auditoria.

---

# 5. JORNADA DO RESPONSÁVEL

Implemente a jornada com indicador visual de progresso.

## Etapa 1 — Tela inicial

Exibir:

- logotipo configurável;
- nome da viagem;
- destino;
- programa;
- data de embarque;
- mensagem de boas-vindas;
- botão “Acessar escolha de assento”.

## Etapa 2 — Informar e-mail

Campo:

- e-mail do responsável.

Ação:

- solicitar código de acesso.

Não revelar se o e-mail existe.

## Etapa 3 — Validar código

Campo:

- código de seis dígitos.

Requisitos:

- expiração;
- contador de reenvio;
- limite de tentativas;
- mensagens de erro claras;
- botão de reenviar;
- opção de retornar e corrigir o e-mail.

## Etapa 4 — Selecionar aluno

Caso haja mais de um aluno elegível, exibir cards com:

- nome;
- turma;
- unidade;
- viagem;
- status atual.

Não exibir alunos fora da viagem ativa.

## Etapa 5 — Confirmar dados

Exibir:

- nome do aluno;
- turma;
- unidade;
- viagem;
- ônibus atribuído.

Botões:

- “Os dados estão corretos”;
- “Solicitar correção”.

Solicitações devem ser registradas para acompanhamento administrativo.

## Etapa 6 — Ler regras

Exibir regras objetivas e exigir aceite antes do mapa.

## Etapa 7 — Escolher assento

Exibir apenas o ônibus atribuído.

O mapa deve apresentar:

- motorista;
- frente do ônibus;
- corredor;
- fileiras;
- numeração;
- assentos disponíveis;
- assentos ocupados;
- assentos bloqueados;
- assentos reservados;
- assentos acessíveis ou prioritários.

Não exibir nomes dos demais alunos.

## Etapa 8 — Revisar escolha

Exibir:

- aluno;
- ônibus;
- assento;
- posição;
- prazo de alteração.

## Etapa 9 — Consultar documentos

Separar:

- documentos e informações a enviar antecipadamente;
- documentos e itens a levar no dia.

Cada requisito deve ser configurável pela administração.

## Etapa 10 — Registrar ciência

Exigir:

- checkbox de ciência;
- nome do declarante;
- relação com o aluno;
- data e hora;
- versão do termo;
- protocolo;
- metadados técnicos mínimos e proporcionais.

Não representar esse aceite como assinatura eletrônica qualificada.

## Etapa 11 — Confirmação final

Exibir:

- mensagem de sucesso;
- aluno;
- ônibus;
- assento;
- protocolo;
- data e hora;
- prazo de alteração;
- status das pendências documentais;
- botão de impressão.

---

# 6. MAPA DE ASSENTOS

Criar um componente reutilizável e responsivo.

O administrador deve poder configurar:

- número de fileiras;
- quantidade de assentos por fileira;
- corredor;
- assentos ausentes;
- porta;
- banheiro;
- escada;
- área técnica;
- assentos bloqueados;
- assentos reservados;
- posições especiais.

Cada assento deve possuir estados:

- disponível;
- selecionado;
- ocupado;
- bloqueado;
- reservado;
- acessível/prioritário.

A interface não deve depender apenas de cores. Utilizar texto, ícones, padrões ou contornos.

Leitores de tela devem receber descrições como:

“Assento 18, lado direito, janela, disponível.”

---

# 7. INTEGRIDADE E CONCORRÊNCIA

Dois participantes não podem confirmar o mesmo assento.

Implemente:

- transações no banco;
- restrições únicas;
- validação no servidor;
- atualização em tempo quase real;
- tratamento de condição de corrida;
- tentativa atômica de reserva.

Fluxo:

1. responsável seleciona;
2. servidor revalida;
3. banco tenta persistir;
4. restrição única decide;
5. somente uma reserva é confirmada;
6. usuário perdedor recebe mensagem e mapa atualizado.

Mensagem:

“Este assento acabou de ser escolhido por outro participante. Selecione outra opção.”

Não confiar no frontend para disponibilidade.

Opcionalmente, implementar bloqueio temporário entre 3 e 5 minutos, com expiração automática.

---

# 8. ÁREA ADMINISTRATIVA

## Dashboard

Indicadores:

- participantes;
- assentos escolhidos;
- alunos sem assento;
- percentual de ocupação;
- termos concluídos;
- pendências documentais;
- correções solicitadas;
- distribuição por ônibus;
- prazo restante.

## Viagens

Permitir:

- criar;
- editar;
- abrir;
- encerrar;
- congelar;
- concluir;
- arquivar.

Status:

- rascunho;
- agendada;
- escolha aberta;
- escolha encerrada;
- em andamento;
- concluída;
- arquivada.

## Ônibus

Permitir:

- cadastrar;
- configurar layout;
- duplicar;
- bloquear assentos;
- reservar para equipe;
- visualizar ocupação;
- realocar participantes.

## Participantes e responsáveis

Permitir:

- importação CSV;
- pré-validação;
- relatório de erros;
- prevenção de duplicidade;
- atualização controlada;
- associação entre responsáveis e alunos;
- consulta de status;
- geração de acesso de contingência.

## Documentos

Permitir:

- configurar requisitos;
- definir prazos;
- acompanhar status;
- registrar análise;
- filtrar pendências;
- exportar relatório.

## Termos

Permitir:

- criar versões;
- publicar nova versão;
- visualizar aceites;
- exigir novo aceite em caso de alteração material.

## Relatórios

Gerar:

- lista por ônibus;
- mapa de assentos;
- participantes sem assento;
- status documental;
- status de termos;
- lista operacional de embarque;
- histórico de alterações.

---

# 9. REGRAS DE NEGÓCIO

Implemente, no mínimo:

1. cada aluno pode possuir apenas um assento por viagem;
2. cada assento pode pertencer a apenas um aluno por viagem;
3. o responsável só pode acessar alunos vinculados ao seu e-mail;
4. apenas alunos inscritos e ativos podem avançar;
5. o aluno só pode escolher assento no ônibus atribuído;
6. assentos bloqueados ou reservados não podem ser escolhidos;
7. alterações dependem do prazo e das permissões;
8. após congelamento, somente administradores podem alterar;
9. alterações administrativas exigem motivo;
10. toda alteração relevante gera auditoria;
11. a reserva pertence ao aluno;
12. o termo possui versão;
13. protocolo final é único;
14. exclusões relevantes usam soft delete ou arquivamento;
15. o sistema alerta sobre lotação insuficiente;
16. o sistema impede layout incompatível com a capacidade;
17. dados médicos não aparecem no mapa;
18. o nome de outros alunos não aparece para responsáveis;
19. correção de e-mail é administrativa;
20. novo código invalida os anteriores.

---

# 10. SEGURANÇA, PRIVACIDADE E LGPD

Considerar que a aplicação envolve dados de menores.

Implementar:

- autenticação passwordless segura;
- autorização por perfil;
- menor privilégio;
- proteção contra acesso horizontal;
- validação no servidor;
- proteção contra SQL injection, XSS e CSRF quando aplicável;
- rate limiting;
- sessões expiradas;
- logs de auditoria;
- segregação de dados sensíveis;
- HTTPS em produção;
- segredos em variáveis de ambiente;
- uploads privados;
- URLs assinadas;
- política de retenção;
- backups;
- mensagens de erro não reveladoras;
- prevenção de enumeração de contas.

Não armazenar:

- códigos OTP em texto puro;
- documentos em áreas públicas;
- dados sensíveis em logs;
- segredos no repositório;
- dados reais em seeds;
- senhas de responsáveis.

Criar aviso de privacidade configurável com placeholders para revisão jurídica.

---

# 11. ACESSIBILIDADE

Atender, na medida possível, às WCAG 2.2 AA:

- navegação por teclado;
- foco visível;
- contraste;
- labels;
- mensagens de erro associadas;
- semântica;
- áreas de toque adequadas;
- suporte a leitores de tela;
- redução de movimento;
- estados não dependentes apenas de cor.

---

# 12. STACK RECOMENDADA

Utilize:

- Next.js com App Router;
- TypeScript;
- React;
- Tailwind CSS;
- shadcn/ui ou biblioteca acessível equivalente;
- PostgreSQL;
- Prisma ORM;
- Zod;
- React Hook Form;
- Auth.js ou implementação própria controlada para OTP;
- Resend, Postmark ou adaptador equivalente para e-mail;
- Vitest ou Jest;
- Playwright;
- deploy preparado para Vercel;
- banco gerenciado compatível com PostgreSQL.

Para o MVP, adotar monólito modular.

Domínios:

- authentication;
- guardians;
- participants;
- guardian-participant-links;
- trips;
- buses;
- seats;
- reservations;
- document-requirements;
- acknowledgements;
- reports;
- audit;
- notifications.

---

# 13. MODELO DE DADOS MÍNIMO

Criar entidades para:

- UserAdmin;
- Guardian;
- Participant;
- GuardianParticipant;
- Trip;
- Bus;
- Seat;
- SeatReservation;
- AccessCode;
- AccessSession;
- DocumentRequirement;
- ParticipantDocument;
- AcknowledgementVersion;
- AcknowledgementAcceptance;
- CorrectionRequest;
- EmailDelivery;
- AuditLog.

## Requisitos específicos

### Guardian

- id;
- fullName;
- email normalizado;
- status;
- createdAt;
- updatedAt.

### GuardianParticipant

- guardianId;
- participantId;
- relationship;
- isPrimary;
- authorized;
- createdAt.

### AccessCode

- id;
- guardianId ou e-mail normalizado;
- codeHash;
- expiresAt;
- usedAt;
- attemptCount;
- resendCount;
- requestedIpHash opcional;
- createdAt.

### AccessSession

- id;
- guardianId;
- tokenHash;
- expiresAt;
- revokedAt;
- createdAt.

### SeatReservation

Adicionar restrições únicas:

- participantId + tripId;
- seatId + tripId.

Revisar o modelo e documentar decisões.

---

# 14. ROTAS

## Responsável

- `/`
- `/acesso`
- `/acesso/codigo`
- `/alunos`
- `/viagem/[tripId]/aluno/[participantId]`
- `/viagem/[tripId]/regras`
- `/viagem/[tripId]/assento`
- `/viagem/[tripId]/revisao`
- `/viagem/[tripId]/documentos`
- `/viagem/[tripId]/termo`
- `/viagem/[tripId]/confirmacao`

## Administração

- `/admin`
- `/admin/viagens`
- `/admin/viagens/[id]`
- `/admin/viagens/[id]/onibus`
- `/admin/viagens/[id]/participantes`
- `/admin/viagens/[id]/responsaveis`
- `/admin/viagens/[id]/assentos`
- `/admin/viagens/[id]/documentos`
- `/admin/viagens/[id]/termo`
- `/admin/viagens/[id]/relatorios`
- `/admin/viagens/[id]/auditoria`
- `/admin/configuracoes`

---

# 15. TESTES OBRIGATÓRIOS

## Unitários

- geração e validação de OTP;
- expiração;
- uso único;
- limite de tentativas;
- normalização de e-mail;
- prazo de escolha;
- disponibilidade do assento;
- regras de alteração;
- protocolo;
- autorização;
- importação.

## Integração

- solicitação de código;
- validação de código;
- múltiplos alunos para o mesmo responsável;
- múltiplos responsáveis para o mesmo aluno;
- reserva;
- conflito;
- alteração;
- bloqueio;
- aceite;
- upload;
- exportação.

## End-to-end

1. responsável informa e-mail;
2. recebe código;
3. valida;
4. seleciona aluno;
5. confirma dados;
6. aceita regras;
7. escolhe assento;
8. confirma;
9. consulta documentos;
10. aceita termo;
11. recebe protocolo.

Criar teste concorrente com dois usuários tentando reservar o mesmo assento.

Apenas um pode obter sucesso.

---

# 16. DADOS DE DESENVOLVIMENTO

Criar seed com:

- uma viagem fictícia NR English & Action;
- dois ônibus;
- pelo menos 40 alunos fictícios;
- responsáveis fictícios;
- um responsável com dois alunos;
- um aluno com dois responsáveis;
- assentos em estados variados;
- requisitos documentais;
- termos;
- um administrador;
- caixa de e-mail local.

Nunca usar dados reais.

---

# 17. ENTREGÁVEIS

Entregar:

1. aplicação funcional;
2. código organizado;
3. migrations;
4. seed;
5. autenticação OTP;
6. painel do responsável;
7. painel administrativo;
8. mapa de assentos;
9. controle de concorrência;
10. documentos;
11. termo versionado;
12. auditoria;
13. relatórios;
14. testes;
15. README;
16. `.env.example`;
17. instruções de deploy;
18. decisões arquiteturais;
19. limitações;
20. backlog.

---

# 18. FASES DE EXECUÇÃO

## Fase 1 — Diagnóstico

Antes de codificar:

- resumir o problema;
- listar premissas;
- identificar lacunas;
- definir arquitetura;
- definir modelo de dados;
- definir segurança;
- apresentar estrutura de pastas;
- apresentar plano.

Não interromper o desenvolvimento por lacunas não críticas. Resolver por configuração e registrar premissas.

## Fase 2 — Fundação

- projeto;
- banco;
- migrations;
- seed;
- tema;
- autenticação administrativa;
- autenticação OTP;
- e-mail local.

## Fase 3 — Jornada do responsável

- e-mail;
- OTP;
- seleção de aluno;
- dados;
- regras;
- mapa;
- reserva;
- documentos;
- termo;
- protocolo.

## Fase 4 — Administração

- dashboard;
- viagens;
- ônibus;
- participantes;
- responsáveis;
- vínculos;
- documentos;
- termos;
- relatórios;
- auditoria.

## Fase 5 — Qualidade

- testes;
- acessibilidade;
- segurança;
- responsividade;
- tratamento de erros;
- observabilidade;
- documentação.

## Fase 6 — Validação

Executar:

- lint;
- typecheck;
- testes;
- build;
- revisão de segurança;
- revisão de acessibilidade.

Corrigir falhas antes de concluir.

---

# 19. REGRAS DE EXECUÇÃO PARA O CODEX

- Não criar autenticação por senha para responsáveis.
- Não permitir cadastro público.
- Não usar dados reais.
- Não confiar no frontend.
- Não omitir concorrência.
- Não exibir nomes de outros alunos.
- Não armazenar OTP em texto puro.
- Não declarar teste executado sem evidência.
- Não declarar build concluído sem executar.
- Não deixar requisitos críticos apenas simulados.
- Não expor segredos.
- Não simplificar removendo segurança essencial.
- Registrar decisões técnicas.
- Priorizar legibilidade.
- Usar tipagem estrita.
- Documentar limitações.
- Manter rastreabilidade.

---

# 20. RESULTADO FINAL

Ao concluir, apresentar:

## Resumo executivo

- funcionalidades;
- arquitetura;
- segurança;
- decisões.

## Evidências

- lint;
- typecheck;
- testes;
- build.

## Execução local

- instalação;
- variáveis;
- banco;
- migrations;
- seed;
- e-mail local;
- credenciais fictícias.

## Validação manual

Roteiros para:

- responsável com um aluno;
- responsável com dois alunos;
- aluno com dois responsáveis;
- OTP expirado;
- conflito de assento;
- alteração administrativa;
- termo;
- documentação;
- relatórios.

## Pendências

Classificar:

- bloqueadoras;
- importantes;
- futuras.

## Insumos necessários do Cubo

- identidade visual;
- lista oficial;
- e-mails dos responsáveis;
- vínculos responsável–aluno;
- configuração real dos ônibus;
- regras finais;
- documentos exigidos;
- conteúdo jurídico;
- prazo;
- responsáveis administrativos;
- domínio;
- provedor de e-mail;
- política de retenção;
- validação de privacidade e safeguarding.

Comece pela Fase 1 e prossiga até entregar um MVP funcional.
