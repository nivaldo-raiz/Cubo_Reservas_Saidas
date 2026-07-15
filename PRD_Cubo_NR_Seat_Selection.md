# PRD — Plataforma de Escolha de Assentos
## Cubo Global School — Viagem NR English & Action

**Versão:** 1.0  
**Status:** Pronto para desenvolvimento do MVP  
**Responsável de negócio:** Diretoria Executiva — Cubo Global School  
**Produto:** Plataforma web de escolha antecipada de assentos e registro de orientações de viagem

---

# 1. Resumo executivo

O Cubo Global School realizará uma viagem educacional ao NR para participação no programa English & Action.

O processo atual de organização de ônibus, escolha de assentos, comunicação de documentos e confirmação de orientações tende a gerar trabalho manual, conflitos, mensagens fragmentadas e baixa rastreabilidade.

A solução proposta é uma aplicação web responsiva na qual responsáveis previamente cadastrados acessam o sistema por **e-mail e código temporário**, sem senha, visualizam os alunos vinculados à sua conta, escolhem o assento no ônibus atribuído, consultam requisitos documentais, registram ciência e recebem um protocolo final.

A equipe do Cubo utilizará um painel administrativo para gerenciar viagens, ônibus, participantes, responsáveis, vínculos, assentos, documentos, termos, relatórios e auditoria.

---

# 2. Problema

## 2.1. Problema operacional

O processo pode depender de:

- planilhas;
- mensagens individuais;
- conferência manual;
- registros distribuídos;
- resposta repetitiva a famílias;
- validação manual de assentos;
- ausência de trilha de auditoria.

## 2.2. Riscos atuais

- dois alunos solicitarem o mesmo assento;
- escolha sem confirmação formal;
- falta de clareza sobre prazos;
- responsáveis não receberem orientações;
- documentos pendentes sem visibilidade;
- alterações sem histórico;
- exposição indevida de dados;
- dependência excessiva da equipe administrativa.

---

# 3. Objetivos

## 3.1. Objetivo principal

Digitalizar e controlar a escolha antecipada de assentos, reduzindo trabalho manual e aumentando clareza, segurança e rastreabilidade.

## 3.2. Objetivos específicos

- permitir acesso simples sem senha;
- restringir acesso aos responsáveis autorizados;
- permitir escolha visual de assentos;
- impedir dupla reserva;
- consolidar orientações documentais;
- registrar ciência;
- gerar protocolo;
- fornecer visão operacional ao Cubo;
- produzir relatórios para embarque;
- manter histórico de alterações.

---

# 4. Não objetivos do MVP

O MVP não incluirá:

- pagamento;
- hospedagem;
- formação de quartos;
- rastreamento em tempo real;
- aplicativo nativo;
- rede social;
- chat entre alunos;
- assinatura eletrônica qualificada;
- integração governamental;
- reconhecimento facial;
- prontuário médico;
- gestão completa da viagem.

---

# 5. Usuários

## 5.1. Responsável

Pessoa previamente cadastrada e vinculada a um ou mais alunos.

Necessidades:

- acesso simples;
- confirmação de identidade;
- visão dos filhos elegíveis;
- escolha clara;
- confirmação segura;
- orientações objetivas;
- comprovante final.

## 5.2. Administrador

Colaborador autorizado do Cubo.

Necessidades:

- controle da operação;
- gestão de participantes;
- configuração dos ônibus;
- acompanhamento de pendências;
- capacidade de intervir;
- exportação;
- auditoria.

## 5.3. Aluno

Beneficiário da reserva.

No MVP, o fluxo principal será realizado pelo responsável. O aluno não possuirá autenticação própria, salvo decisão posterior.

---

# 6. Premissas

1. O Cubo possui e-mails de responsáveis.
2. O Cubo consegue relacionar responsáveis e alunos.
3. Os participantes da viagem serão previamente importados.
4. Cada aluno será previamente alocado a um ônibus.
5. O acesso público será fechado.
6. O responsável não criará senha.
7. A escolha ocorrerá em janela definida.
8. A escola poderá alterar assentos por segurança ou operação.
9. Requisitos documentais serão configuráveis.
10. Conteúdo jurídico será revisado pela escola.

---

# 7. Decisão de autenticação

## 7.1. Modelo

Autenticação passwordless por:

- e-mail previamente cadastrado;
- código temporário de seis dígitos;
- validade de 10 minutos;
- uso único.

## 7.2. Regras

- não haverá cadastro público;
- não haverá senha para responsáveis;
- um novo código invalida os anteriores;
- o sistema deve limitar tentativas;
- o sistema deve limitar reenvios;
- mensagens públicas não devem confirmar existência do e-mail;
- sessões devem expirar;
- códigos devem ser armazenados como hash;
- ações devem ser registradas.

## 7.3. Contingência

Administrador poderá:

- reenviar acesso;
- gerar código temporário;
- gerar link de contingência;
- corrigir vínculo;
- atualizar e-mail mediante processo interno.

---

# 8. Escopo funcional

## 8.1. Jornada do responsável

### FR-001 — Informar e-mail

O responsável informa o e-mail cadastrado.

**Critério de aceite:** o sistema retorna mensagem neutra, independentemente da existência do e-mail.

### FR-002 — Receber código

O sistema envia código temporário quando houver vínculo elegível.

**Critério de aceite:** código válido por 10 minutos e inutilizado após uso.

### FR-003 — Validar código

O responsável informa o código.

**Critério de aceite:** acesso concedido somente com código válido, não expirado e não utilizado.

### FR-004 — Selecionar aluno

O sistema exibe alunos vinculados e inscritos.

**Critério de aceite:** nenhum aluno sem vínculo ou fora da viagem é exibido.

### FR-005 — Confirmar dados

O responsável valida os dados do aluno.

**Critério de aceite:** erro cadastral gera solicitação, não edição direta.

### FR-006 — Ler regras

O responsável lê e aceita regras antes de escolher.

**Critério de aceite:** mapa indisponível até aceite.

### FR-007 — Visualizar ônibus

O responsável visualiza apenas o ônibus atribuído.

**Critério de aceite:** não há navegação para outros ônibus.

### FR-008 — Visualizar assentos

O sistema apresenta estados de assento.

**Critério de aceite:** disponível, ocupado, bloqueado, reservado e selecionado são distinguíveis sem depender apenas de cor.

### FR-009 — Reservar assento

O responsável seleciona e confirma.

**Critério de aceite:** reserva é persistida apenas se o assento continuar disponível.

### FR-010 — Tratar concorrência

Dois usuários tentam o mesmo assento.

**Critério de aceite:** apenas um confirma.

### FR-011 — Alterar assento

O responsável altera dentro do prazo, se permitido.

**Critério de aceite:** histórico preservado.

### FR-012 — Consultar documentos

O responsável consulta requisitos.

**Critério de aceite:** requisitos separados entre envio antecipado e itens para o dia.

### FR-013 — Registrar ciência

O responsável aceita termo versionado.

**Critério de aceite:** sistema registra versão, declarante, relação, data e protocolo.

### FR-014 — Receber comprovante

O sistema apresenta confirmação.

**Critério de aceite:** comprovante contém aluno, ônibus, assento, protocolo e data.

---

# 9. Escopo administrativo

### FR-101 — Criar viagem

### FR-102 — Editar viagem

### FR-103 — Definir prazos

### FR-104 — Abrir e encerrar escolha

### FR-105 — Congelar distribuição

### FR-106 — Cadastrar ônibus

### FR-107 — Configurar layout

### FR-108 — Bloquear assentos

### FR-109 — Reservar assentos para equipe

### FR-110 — Importar participantes

### FR-111 — Importar responsáveis

### FR-112 — Importar vínculos

### FR-113 — Alocar alunos em ônibus

### FR-114 — Realocar aluno

### FR-115 — Configurar requisitos documentais

### FR-116 — Atualizar status documental

### FR-117 — Criar termo

### FR-118 — Versionar termo

### FR-119 — Consultar aceites

### FR-120 — Consultar solicitações de correção

### FR-121 — Gerar relatórios

### FR-122 — Consultar auditoria

### FR-123 — Gerar acesso de contingência

---

# 10. Regras de negócio

## BR-001

Um aluno pode possuir no máximo um assento por viagem.

## BR-002

Um assento pode pertencer a no máximo um aluno por viagem.

## BR-003

A reserva pertence ao aluno.

## BR-004

Um responsável pode acessar mais de um aluno.

## BR-005

Um aluno pode ter mais de um responsável autorizado.

## BR-006

O responsável visualiza apenas alunos vinculados.

## BR-007

O responsável visualiza apenas o ônibus do aluno.

## BR-008

Nomes de outros alunos não são exibidos.

## BR-009

Assentos bloqueados ou reservados não podem ser escolhidos.

## BR-010

Escolha e alteração respeitam janela de tempo.

## BR-011

Após congelamento, apenas administrador altera.

## BR-012

Alteração administrativa exige motivo.

## BR-013

Toda alteração gera log.

## BR-014

Termos são versionados.

## BR-015

Mudança material pode exigir novo aceite.

## BR-016

Protocolos são únicos.

## BR-017

Novo OTP invalida OTPs anteriores.

## BR-018

OTP não é armazenado em texto puro.

## BR-019

E-mail não pode ser alterado pelo responsável.

## BR-020

Dados médicos não aparecem no mapa.

---

# 11. Fluxos críticos

## 11.1. Acesso com um aluno

1. informa e-mail;
2. recebe código;
3. valida;
4. entra diretamente no aluno;
5. confirma dados;
6. aceita regras;
7. escolhe assento;
8. confirma;
9. lê documentos;
10. aceita termo;
11. recebe protocolo.

## 11.2. Acesso com dois alunos

1. autentica;
2. visualiza lista;
3. escolhe primeiro aluno;
4. conclui fluxo;
5. retorna;
6. escolhe segundo aluno;
7. conclui fluxo independente.

## 11.3. Dois responsáveis para o mesmo aluno

1. responsável A reserva;
2. responsável B acessa;
3. sistema mostra assento existente;
4. alteração segue regras;
5. histórico registra ator e ação.

## 11.4. Conflito de assento

1. dois usuários selecionam;
2. ambos tentam confirmar;
3. banco aceita somente um;
4. outro recebe mensagem;
5. mapa é atualizado.

---

# 12. Requisitos não funcionais

## NFR-001 — Responsividade

Funcionamento adequado em celular, tablet e desktop.

## NFR-002 — Performance

Principais telas devem carregar rapidamente em conexão móvel comum.

## NFR-003 — Disponibilidade

Aplicação preparada para operação em janela crítica de escolha.

## NFR-004 — Segurança

Autenticação, autorização, rate limiting e logs.

## NFR-005 — Privacidade

Minimização de dados e controle de acesso.

## NFR-006 — Acessibilidade

WCAG 2.2 AA na medida possível.

## NFR-007 — Auditoria

Ações administrativas e alterações de assento registradas.

## NFR-008 — Integridade

Restrições de banco impedem dupla reserva.

## NFR-009 — Observabilidade

Logs estruturados e captura de erros.

## NFR-010 — Configurabilidade

Regras, documentos, termos e identidade visual configuráveis.

---

# 13. Segurança e LGPD

## Dados tratados

- nome do responsável;
- e-mail;
- vínculo com o aluno;
- nome do aluno;
- turma;
- unidade;
- viagem;
- ônibus;
- assento;
- status documental;
- registro de ciência.

## Controles mínimos

- HTTPS;
- menor privilégio;
- validação server-side;
- hash de OTP;
- sessão expirada;
- rate limiting;
- proteção contra enumeração;
- logs sem dados sensíveis;
- arquivos privados;
- URLs assinadas;
- política de retenção;
- backups;
- revisão jurídica.

## Safeguarding

- não exibir lista pública de passageiros;
- não exibir nomes no mapa;
- não permitir navegação entre alunos sem vínculo;
- restringir dados sensíveis a administradores autorizados.

---

# 14. Modelo de dados conceitual

Entidades:

- AdminUser;
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

Relações principais:

- Guardian N:N Participant;
- Trip 1:N Bus;
- Bus 1:N Seat;
- Trip 1:N Participant;
- Participant 1:N SeatReservation;
- Trip 1:N DocumentRequirement;
- Participant 1:N ParticipantDocument;
- Trip 1:N AcknowledgementVersion;
- Participant 1:N AcknowledgementAcceptance.

---

# 15. Estados principais

## Viagem

- rascunho;
- agendada;
- escolha aberta;
- escolha encerrada;
- em andamento;
- concluída;
- arquivada.

## Assento

- disponível;
- ocupado;
- bloqueado;
- reservado;
- acessível/prioritário.

## Documento

- não enviado;
- enviado;
- em análise;
- aprovado;
- precisa de correção;
- dispensado.

## Solicitação de correção

- aberta;
- em análise;
- resolvida;
- rejeitada.

---

# 16. Relatórios

O MVP deve gerar:

1. participantes por ônibus;
2. mapa de assentos;
3. participantes sem assento;
4. termos pendentes;
5. documentos pendentes;
6. lista operacional de embarque;
7. histórico de alterações;
8. solicitações de correção.

Formatos:

- CSV obrigatório;
- impressão/PDF desejável.

---

# 17. Métricas de sucesso

## Operacionais

- percentual de assentos escolhidos;
- percentual de termos concluídos;
- percentual de documentos regularizados;
- quantidade de intervenções manuais;
- quantidade de conflitos;
- tempo médio para conclusão;
- volume de solicitações de suporte.

## Meta sugerida para o piloto

- 90% dos responsáveis concluindo sem suporte;
- 100% das reservas sem duplicidade;
- 95% dos processos concluídos dentro do prazo;
- redução relevante de mensagens individuais;
- lista final de ônibus exportável sem ajuste manual extenso.

---

# 18. Critérios de pronto do MVP

O MVP estará pronto quando:

1. administrador cria uma viagem;
2. administrador cadastra ônibus;
3. administrador configura assentos;
4. dados podem ser importados;
5. responsável recebe OTP;
6. OTP é validado com segurança;
7. responsável vê apenas alunos vinculados;
8. responsável escolhe assento;
9. concorrência é tratada;
10. documentos são exibidos;
11. termo é aceito;
12. protocolo é gerado;
13. administrador acompanha status;
14. relatórios são exportados;
15. auditoria funciona;
16. aplicação funciona no celular;
17. lint, typecheck, testes e build passam;
18. README permite execução sem conhecimento prévio.

---

# 19. Dependências de negócio

Antes da publicação, o Cubo deverá fornecer:

- identidade visual;
- lista de participantes;
- e-mails dos responsáveis;
- vínculos responsável–aluno;
- configuração dos ônibus;
- prazo da escolha;
- regras finais;
- documentos obrigatórios;
- checklist do dia;
- conteúdo do termo;
- aviso de privacidade;
- contatos de suporte;
- responsáveis administrativos;
- domínio;
- provedor de e-mail.

---

# 20. Riscos

## Risco 1 — Base de e-mails desatualizada

**Impacto:** responsáveis não acessam.  
**Mitigação:** validação prévia, relatório de inconsistências e contingência administrativa.

## Risco 2 — Picos de acesso

**Impacto:** lentidão ou falhas.  
**Mitigação:** testes de carga simples, banco gerenciado e operações atômicas.

## Risco 3 — Duplicidade de assento

**Impacto:** conflito operacional.  
**Mitigação:** restrição única e transação.

## Risco 4 — Exposição de dados

**Impacto:** risco de privacidade e safeguarding.  
**Mitigação:** autorização, minimização e ausência de nomes no mapa.

## Risco 5 — Não recebimento de e-mail

**Impacto:** aumento de suporte.  
**Mitigação:** reenvio, mensagens claras, provedor confiável e contingência.

## Risco 6 — Alterações tardias

**Impacto:** divergência entre sistema e operação.  
**Mitigação:** congelamento, auditoria e exportação final.

---

# 21. Backlog posterior

- envio de lembretes automáticos;
- dashboards avançados;
- integração com Google Workspace;
- integração com sistema acadêmico;
- assinatura eletrônica;
- gestão de quartos;
- presença no embarque;
- QR code de check-in;
- app mobile;
- notificações por WhatsApp;
- múltiplas viagens simultâneas;
- autosserviço controlado de atualização cadastral;
- relatórios analíticos de adesão.

---

# 22. Plano de implementação sugerido

## Sprint 1 — Fundação

- arquitetura;
- banco;
- autenticação administrativa;
- OTP;
- importação básica;
- seed.

## Sprint 2 — Jornada do responsável

- seleção de aluno;
- regras;
- mapa;
- reserva;
- concorrência;
- confirmação.

## Sprint 3 — Documentos e termo

- requisitos;
- status;
- termo;
- protocolo;
- comprovante.

## Sprint 4 — Administração e qualidade

- dashboard;
- relatórios;
- auditoria;
- acessibilidade;
- testes;
- deploy.

---

# 23. Decisões fechadas

- acesso por e-mail e OTP;
- sem senha para responsáveis;
- sem cadastro público;
- aluno previamente alocado ao ônibus;
- nomes de outros alunos ocultos;
- reserva pertencente ao aluno;
- documentos configuráveis;
- termo versionado;
- administração pode realocar;
- concorrência resolvida no banco.

---

# 24. Questões abertas não bloqueadoras

- provedor de e-mail;
- duração exata da sessão;
- possibilidade de troca de assento;
- bloqueio temporário de assento;
- upload direto de documentos no MVP;
- PDF nativo ou impressão do navegador;
- visibilidade parcial de nomes;
- necessidade de integração com base existente;
- volume estimado de participantes.

Essas questões devem ser implementadas como configuração sempre que possível.
