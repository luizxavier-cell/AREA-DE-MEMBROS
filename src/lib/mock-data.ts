// Dados de exemplo da área de membros (somente frontend).
// Tudo aqui será substituído pela API quando o backend existir — a única
// porta de entrada para estes dados é src/lib/api.ts.
import type {
  Announcement,
  Course,
  Faq,
  Lesson,
  LessonKind,
  LiveEvent,
  Material,
  Member,
  Progress,
} from './types';

/** "12:30" or "1:05:30" -> seconds */
function clock(text: string) {
  return text.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

function lesson(
  id: string,
  title: string,
  duration: string,
  options: { kind?: LessonKind; summary?: string; materials?: Material[] } = {},
): Lesson {
  return {
    id,
    title,
    kind: options.kind ?? 'video',
    durationSec: clock(duration),
    summary:
      options.summary ??
      'Nesta aula você vai entender o conceito na prática, com exemplos reais e um passo a passo para aplicar ainda hoje. Assista até o final: no encerramento há uma tarefa curta para fixar o conteúdo.',
    materials: options.materials,
  };
}

const pdf = (name: string, size: string): Material => ({ name, format: 'PDF', size, href: '#' });
const xlsx = (name: string, size: string): Material => ({ name, format: 'XLSX', size, href: '#' });
const zip = (name: string, size: string): Material => ({ name, format: 'ZIP', size, href: '#' });

export const member: Member = {
  name: 'Ana Beatriz Souza',
  email: 'ana.souza@email.com',
  plan: 'Plano Anual',
  memberSince: '2026-03-14',
};

/** Prototype values: any other password signs in, any other code is rejected. */
export const mockAuth = { wrongPassword: 'senha-errada', resetCode: '123456' };

export const courses: Course[] = [
  {
    id: 'comece-por-aqui',
    title: 'Comece por aqui',
    subtitle: 'Tudo o que você precisa para aproveitar a plataforma desde o primeiro dia.',
    description:
      'Um tour rápido pela área de membros: como os cursos estão organizados, onde encontrar os materiais, como participar das mentorias ao vivo e como montar o seu plano de estudos.',
    category: 'Boas-vindas',
    level: 'Todos os níveis',
    instructor: 'Marina Duarte',
    hue: 230,
    icon: 'sparkles',
    access: 'liberado',
    outcomes: [
      'Navegar pela plataforma com confiança',
      'Montar um plano de estudos realista',
      'Saber onde tirar dúvidas e encontrar materiais',
    ],
    certificate: false,
    updatedAt: '2026-09-02',
    modules: [
      {
        id: 'boas-vindas',
        title: 'Boas-vindas',
        lessons: [
          lesson('seja-bem-vinda', 'Seja bem-vinda(o)!', '3:12'),
          lesson('tour-pela-plataforma', 'Tour pela área de membros', '5:40'),
          lesson('comunidade', 'Como participar da comunidade', '2:00', { kind: 'texto' }),
          lesson('plano-de-estudos', 'Seu plano de estudos', '4:25', {
            materials: [pdf('Plano de estudos semanal', '320 KB')],
          }),
        ],
      },
    ],
  },
  {
    id: 'metodo-criador',
    title: 'Método Criador Essencial',
    subtitle: 'Do primeiro post à audiência fiel: o passo a passo completo.',
    description:
      'O programa principal da plataforma. Você vai do posicionamento à monetização com um método testado: definir nicho e persona, planejar conteúdo sem bloqueio criativo, produzir com o que já tem e transformar seguidores em clientes.',
    category: 'Conteúdo',
    level: 'Iniciante',
    instructor: 'Marina Duarte',
    hue: 245,
    icon: 'rocket',
    access: 'liberado',
    outcomes: [
      'Definir um nicho e uma proposta de valor claros',
      'Montar um calendário editorial sustentável',
      'Gravar e editar conteúdos só com o celular',
      'Ler métricas e ajustar a estratégia',
      'Criar sua primeira oferta digital',
    ],
    certificate: true,
    updatedAt: '2026-11-03',
    modules: [
      {
        id: 'fundamentos',
        title: 'Fundamentos',
        lessons: [
          lesson('por-que-criar', 'Por que criar conteúdo hoje', '8:14'),
          lesson('encontrando-seu-nicho', 'Encontrando o seu nicho', '12:30'),
          lesson('persona', 'Definindo a sua persona', '10:05', {
            materials: [pdf('Template de persona', '1,2 MB')],
          }),
          lesson('proposta-de-valor', 'Exercício: sua proposta de valor', '6:00', {
            kind: 'texto',
          }),
        ],
      },
      {
        id: 'planejamento',
        title: 'Planejamento de conteúdo',
        lessons: [
          lesson('pilares', 'Pilares de conteúdo', '9:48'),
          lesson('calendario-editorial', 'Calendário editorial', '14:22', {
            materials: [xlsx('Calendário editorial', '86 KB')],
          }),
          lesson('banco-de-ideias', 'Banco de ideias infinito', '7:35'),
          lesson('reaproveitar', 'Como reaproveitar conteúdo', '11:10'),
        ],
      },
      {
        id: 'producao',
        title: 'Produção',
        lessons: [
          lesson('roteiros', 'Roteiros que prendem a atenção', '16:40', {
            materials: [pdf('Estruturas de roteiro', '540 KB')],
          }),
          lesson('gravando-com-celular', 'Gravando com o celular', '13:05'),
          lesson('luz-e-som', 'Iluminação e som sem gastar', '9:58'),
          lesson('edicao-rapida', 'Edição rápida', '18:20'),
          lesson('capas', 'Capas e miniaturas', '8:44'),
        ],
      },
      {
        id: 'crescimento',
        title: 'Distribuição e crescimento',
        lessons: [
          lesson('algoritmos', 'Algoritmos sem mistério', '12:12'),
          lesson('frequencia', 'Frequência x qualidade', '7:50'),
          lesson('colaboracoes', 'Colaborações', '10:30'),
          lesson('metricas', 'Métricas que importam', '15:05', {
            materials: [xlsx('Painel de métricas', '120 KB')],
          }),
        ],
      },
      {
        id: 'monetizacao',
        title: 'Monetização',
        releaseAt: '2026-12-01T09:00:00-03:00',
        lessons: [
          lesson('primeiros-produtos', 'Seus primeiros produtos', '13:40'),
          lesson('parcerias', 'Parcerias com marcas', '11:25'),
          lesson('precificacao', 'Precificação', '9:15'),
        ],
      },
    ],
  },
  {
    id: 'edicao-de-video',
    title: 'Edição de Vídeo do Zero',
    subtitle: 'Edite vídeos dinâmicos usando apenas o celular e o computador.',
    description:
      'Aprenda a editar com ritmo e narrativa: organização de arquivos, cortes no tempo da fala, B-roll, trilha, legendas e exportação certa para cada rede.',
    category: 'Produção',
    level: 'Intermediário',
    instructor: 'Rafael Lima',
    hue: 210,
    icon: 'clapperboard',
    access: 'liberado',
    outcomes: [
      'Escolher o editor certo para o seu fluxo',
      'Cortar no ritmo da fala',
      'Usar B-roll, trilha e legendas a seu favor',
      'Exportar no formato ideal de cada rede',
    ],
    certificate: true,
    updatedAt: '2026-10-18',
    modules: [
      {
        id: 'primeiros-passos',
        title: 'Primeiros passos',
        lessons: [
          lesson('escolhendo-editor', 'Escolhendo o editor certo', '6:30'),
          lesson('organizando-arquivos', 'Organizando seus arquivos', '5:45'),
          lesson('linha-do-tempo', 'Linha do tempo na prática', '12:10'),
          lesson('cortes-e-transicoes', 'Cortes e transições', '10:55'),
        ],
      },
      {
        id: 'ritmo',
        title: 'Ritmo e narrativa',
        lessons: [
          lesson('cortes-no-ritmo', 'Cortes no ritmo da fala', '9:20'),
          lesson('b-roll', 'B-roll que conta história', '11:40'),
          lesson('trilha', 'Trilha e efeitos sonoros', '8:35'),
          lesson('legendas', 'Legendas automáticas', '7:15'),
        ],
      },
      {
        id: 'acabamento',
        title: 'Acabamento',
        lessons: [
          lesson('cor', 'Correção de cor básica', '13:30'),
          lesson('textos-e-animacoes', 'Textos e animações', '10:05'),
          lesson('exportando', 'Exportando para cada rede', '6:50', {
            materials: [pdf('Guia de formatos por rede', '410 KB')],
          }),
          lesson('projeto-final', 'Projeto final', '5:00', { kind: 'texto' }),
        ],
      },
    ],
  },
  {
    id: 'mentorias-ao-vivo',
    title: 'Mentorias ao Vivo',
    subtitle: 'Gravações dos encontros mensais, com perguntas e respostas.',
    description:
      'Todo mês a Marina responde dúvidas, analisa perfis e traz bastidores. Aqui ficam as gravações completas de cada encontro.',
    category: 'Ao vivo',
    level: 'Todos os níveis',
    instructor: 'Marina Duarte',
    hue: 340,
    icon: 'radio',
    access: 'liberado',
    outcomes: ['Tirar dúvidas direto com a mentora', 'Aprender com a análise de outros perfis'],
    certificate: false,
    updatedAt: '2026-10-22',
    modules: [
      {
        id: 'encontros-2026',
        title: 'Encontros de 2026',
        lessons: [
          lesson('mentoria-10', 'Mentoria #10 — Planejamento de fim de ano', '1:24:10', {
            kind: 'ao-vivo',
          }),
          lesson('mentoria-9', 'Mentoria #9 — Análise de perfis', '1:12:45', { kind: 'ao-vivo' }),
          lesson('mentoria-8', 'Mentoria #8 — Monetização', '1:31:20', { kind: 'ao-vivo' }),
        ],
      },
      {
        id: 'encontros-2025',
        title: 'Encontros de 2025',
        lessons: [
          lesson('mentoria-7', 'Mentoria #7 — Roteiros', '1:05:30', { kind: 'ao-vivo' }),
          lesson('mentoria-6', 'Mentoria #6 — Crescimento orgânico', '1:18:05', {
            kind: 'ao-vivo',
          }),
        ],
      },
    ],
  },
  {
    id: 'bio-que-converte',
    title: 'Mini-curso: Bio que Converte',
    subtitle: 'Reescreva sua bio em 30 minutos e transforme visitas em seguidores.',
    description:
      'Um mini-curso direto ao ponto sobre a primeira impressão do seu perfil: nome, bio, link e destaques.',
    category: 'Posicionamento',
    level: 'Iniciante',
    instructor: 'Marina Duarte',
    hue: 160,
    icon: 'badge-check',
    access: 'liberado',
    outcomes: ['Escrever uma bio clara e atrativa', 'Organizar link e destaques do perfil'],
    certificate: true,
    updatedAt: '2026-07-10',
    modules: [
      {
        id: 'bio',
        title: 'Sua bio',
        lessons: [
          lesson('anatomia-da-bio', 'A anatomia de uma bio', '9:30'),
          lesson('reescrevendo', 'Reescrevendo a sua bio', '12:15', {
            materials: [pdf('30 modelos de bio', '780 KB')],
          }),
          lesson('link-e-destaques', 'Link e destaques', '8:40'),
        ],
      },
    ],
  },
  {
    id: 'kit-de-templates',
    title: 'Bônus: Kit de Templates',
    subtitle: 'Modelos prontos de roteiro, calendário, mídia kit e proposta comercial.',
    description:
      'Arquivos editáveis para acelerar o seu dia a dia. Baixe, duplique e adapte à sua marca.',
    category: 'Bônus',
    level: 'Todos os níveis',
    instructor: 'Marina Duarte',
    hue: 40,
    icon: 'gift',
    access: 'liberado',
    outcomes: ['Ganhar tempo com modelos testados'],
    certificate: false,
    updatedAt: '2026-10-27',
    modules: [
      {
        id: 'materiais',
        title: 'Materiais',
        lessons: [
          lesson('templates-de-roteiro', 'Templates de roteiro', '3:00', {
            kind: 'texto',
            materials: [pdf('Templates de roteiro', '640 KB')],
          }),
          lesson('calendario-2027', 'Calendário editorial 2027', '2:00', {
            kind: 'texto',
            materials: [xlsx('Calendário editorial 2027', '92 KB')],
          }),
          lesson('midia-kit', 'Mídia kit editável', '4:00', {
            kind: 'texto',
            materials: [zip('Mídia kit (Canva + PDF)', '18 MB')],
          }),
          lesson('proposta-comercial', 'Proposta comercial', '3:00', {
            kind: 'texto',
            materials: [pdf('Proposta comercial', '450 KB')],
          }),
        ],
      },
    ],
  },
  {
    id: 'marca-pessoal',
    title: 'Marca Pessoal na Prática',
    subtitle: 'Construa uma presença autêntica, coerente e memorável.',
    description:
      'Autoconhecimento, identidade e autoridade: os três pilares de uma marca pessoal que as pessoas reconhecem e recomendam.',
    category: 'Posicionamento',
    level: 'Iniciante',
    instructor: 'Marina Duarte',
    hue: 18,
    icon: 'fingerprint',
    access: 'liberado',
    outcomes: [
      'Transformar a sua história em ativo',
      'Definir tom de voz e identidade visual',
      'Construir autoridade com provas sociais',
    ],
    certificate: true,
    updatedAt: '2026-08-21',
    modules: [
      {
        id: 'autoconhecimento',
        title: 'Autoconhecimento',
        lessons: [
          lesson('sua-historia', 'Sua história como ativo', '9:40'),
          lesson('tom-de-voz', 'Valores e tom de voz', '11:15'),
          lesson('manifesto', 'Exercício: manifesto pessoal', '4:00', { kind: 'texto' }),
        ],
      },
      {
        id: 'identidade',
        title: 'Identidade',
        lessons: [
          lesson('identidade-visual', 'Identidade visual simples', '12:20'),
          lesson('perfis-otimizados', 'Bio e perfis otimizados', '8:05'),
          lesson('fotos', 'Fotos que comunicam', '7:30'),
        ],
      },
      {
        id: 'autoridade',
        title: 'Autoridade',
        lessons: [
          lesson('provas-sociais', 'Provas sociais', '9:10'),
          lesson('bastidores', 'Conteúdo de bastidores', '6:45'),
          lesson('reputacao', 'Construindo reputação', '10:25'),
        ],
      },
    ],
  },
  {
    id: 'masterclass-negocio-digital',
    title: 'Masterclass: Negócio Digital',
    subtitle: 'Transforme sua audiência em um negócio sustentável e previsível.',
    description:
      'Funis, lançamentos, recorrência e gestão: a estrutura de negócio por trás de criadores que vivem do próprio conteúdo.',
    category: 'Negócios',
    level: 'Avançado',
    instructor: 'Marina Duarte',
    hue: 48,
    icon: 'briefcase',
    access: 'bloqueado',
    offerUrl: '#',
    outcomes: [
      'Desenhar um funil de vendas simples',
      'Planejar um lançamento do zero',
      'Criar uma oferta recorrente',
    ],
    certificate: true,
    updatedAt: '2026-10-01',
    modules: [
      {
        id: 'estrutura',
        title: 'Estrutura do negócio',
        lessons: [
          lesson('modelo-de-negocio', 'Modelo de negócio do criador', '18:20'),
          lesson('funil', 'Funil de vendas simples', '21:05'),
        ],
      },
      {
        id: 'lancamentos',
        title: 'Lançamentos',
        lessons: [
          lesson('planejando-lancamento', 'Planejando um lançamento', '24:40'),
          lesson('recorrencia', 'Recorrência e assinatura', '19:15'),
        ],
      },
    ],
  },
  {
    id: 'fotografia-mobile',
    title: 'Fotografia Mobile',
    subtitle: 'Fotos profissionais para o seu perfil usando apenas o celular.',
    description: 'Composição, luz natural e edição no celular para um feed com cara de estúdio.',
    category: 'Produção',
    level: 'Iniciante',
    instructor: 'Rafael Lima',
    hue: 185,
    icon: 'camera',
    access: 'em-breve',
    launchAt: '2027-01-20',
    outcomes: ['Compor fotos com intenção', 'Aproveitar a luz natural', 'Editar no celular'],
    certificate: true,
    updatedAt: '2026-11-01',
    modules: [
      {
        id: 'fundamentos-foto',
        title: 'Fundamentos',
        lessons: [
          lesson('composicao', 'Composição', '10:00'),
          lesson('luz-natural', 'Luz natural', '12:00'),
        ],
      },
    ],
  },
];

/** Seed progress for the example member. */
export function initialProgress(): Progress {
  return {
    completed: [
      'comece-por-aqui/seja-bem-vinda',
      'comece-por-aqui/tour-pela-plataforma',
      'comece-por-aqui/comunidade',
      'comece-por-aqui/plano-de-estudos',
      'metodo-criador/por-que-criar',
      'metodo-criador/encontrando-seu-nicho',
      'metodo-criador/persona',
      'metodo-criador/proposta-de-valor',
      'metodo-criador/pilares',
      'metodo-criador/calendario-editorial',
      'metodo-criador/banco-de-ideias',
      'edicao-de-video/escolhendo-editor',
      'edicao-de-video/organizando-arquivos',
      'mentorias-ao-vivo/mentoria-9',
      'bio-que-converte/anatomia-da-bio',
      'bio-que-converte/reescrevendo',
      'bio-que-converte/link-e-destaques',
      'kit-de-templates/templates-de-roteiro',
      'kit-de-templates/calendario-2027',
    ],
    lastLesson: {
      'comece-por-aqui': 'plano-de-estudos',
      'metodo-criador': 'reaproveitar',
      'edicao-de-video': 'linha-do-tempo',
      'mentorias-ao-vivo': 'mentoria-9',
      'bio-que-converte': 'link-e-destaques',
      'kit-de-templates': 'calendario-2027',
    },
    lastCourseId: 'metodo-criador',
  };
}

export const certificateIssuedAt: Record<string, string> = {
  'bio-que-converte': '2026-07-28',
};

export const announcements: Announcement[] = [
  {
    id: 'mentoria-novembro',
    title: 'Mentoria de novembro confirmada',
    body: 'O encontro será no dia 18, às 20h. Envie suas perguntas pela comunidade até o dia 16.',
    publishedAt: '2026-11-08',
    pinned: true,
  },
  {
    id: 'modulo-monetizacao',
    title: 'Módulo de Monetização chega em dezembro',
    body: 'As três aulas finais do Método Criador Essencial serão liberadas no dia 1º de dezembro.',
    publishedAt: '2026-11-03',
  },
  {
    id: 'kit-atualizado',
    title: 'Kit de Templates atualizado',
    body: 'Incluímos o calendário editorial de 2027 e um novo modelo de proposta comercial.',
    publishedAt: '2026-10-27',
  },
];

export const nextLive: LiveEvent = {
  id: 'mentoria-11',
  title: 'Mentoria #11 — Metas para 2027',
  startsAt: '2026-11-18T20:00:00-03:00',
  durationMin: 90,
  host: 'Marina Duarte',
  joinUrl: '#',
};

export const faqs: Faq[] = [
  {
    question: 'Por quanto tempo terei acesso aos cursos?',
    answer:
      'Enquanto o seu plano estiver ativo. No Plano Anual o acesso é renovado automaticamente a cada 12 meses — você pode conferir a data em Minha conta.',
  },
  {
    question: 'Posso assistir às aulas pelo celular?',
    answer:
      'Sim. A plataforma funciona em qualquer navegador, no computador, tablet ou celular, e o seu progresso é sincronizado entre os dispositivos.',
  },
  {
    question: 'Como recebo o certificado?',
    answer:
      'Ao concluir 100% das aulas de um curso com certificado, ele é emitido automaticamente e fica disponível na página Certificados para baixar ou compartilhar.',
  },
  {
    question: 'Perdi uma mentoria ao vivo. E agora?',
    answer:
      'Todas as mentorias são gravadas e publicadas no curso Mentorias ao Vivo em até 48 horas após o encontro.',
  },
  {
    question: 'Por que alguns módulos aparecem bloqueados?',
    answer:
      'Alguns conteúdos são liberados de forma programada para você avançar no ritmo certo. A data de liberação aparece ao lado do módulo.',
  },
  {
    question: 'Como altero meu e-mail ou senha?',
    answer:
      'Acesse Minha conta, no menu do seu perfil. Lá você pode atualizar seus dados e sua senha.',
  },
];
