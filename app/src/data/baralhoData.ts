// Baralho de Aventuras Oficial (55 Cartas) & Tabelas de Encontros Aleatórios por Região (Ameaças de Arton)

export type AdventureCardCategory = 'Enredo' | 'Personagem' | 'Ameaça' | 'Local' | 'Objeto' | 'Evento';

export interface NimbSlot {
  role: string;
  allowedTypes: AdventureCardCategory[];
}

export interface AdventureCard {
  id: string;
  pdfPage: number;
  category: AdventureCardCategory;
  title: string;
  description: string;
  examples?: string[];
  bestiaryCategories?: string[];
  nimbSlots?: NimbSlot[];
}

export interface DrawnAdventureSlot {
  role: string;
  card: AdventureCard;
}

export interface GeneratedAdventureDraw {
  id: string;
  timestamp: string;
  enredo: AdventureCard;
  slots: DrawnAdventureSlot[];
}

export interface RandomEncounterTable {
  id: string;
  name: string;
  pdfPage: number;
  entries: Array<[number, number, string]>;
}

export const BARALHO_AVENTURAS: AdventureCard[] = [
  {
    "id": "enredo-3",
    "pdfPage": 3,
    "category": "Enredo",
    "title": "Trabalho de Aventureiro",
    "description": "O grupo está numa aldeia ou cidade quando uma figura conhecida anuncia que precisa de aventureiros para resolver um problema local restrito à região. Os heróis devem descobrir a origem ou fraqueza dos inimigos, combatê-los e receber uma recompensa.",
    "nimbSlots": [
      {
        "role": "Contratante que pede ajuda aos heróis",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Vilão principal por trás do problema",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Capangas do vilão (Grupo 1)",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Capangas do vilão (Grupo 2)",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Local de investigação / 1º embate",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Local do combate decisivo",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Recompensa ou arma/item chave na 1ª localidade",
        "allowedTypes": [
          "Objeto"
        ]
      }
    ]
  },
  {
    "id": "enredo-4",
    "pdfPage": 4,
    "category": "Enredo",
    "title": "Jornada",
    "description": "Os aventureiros precisam chegar até um lugar distante atravessando terrenos exóticos e inexplorados onde maravilhas e horrores aguardam a cada passo. A parte mais importante não é o destino, mas o caminho.",
    "nimbSlots": [
      {
        "role": "Motivo da Jornada (escoltar, buscar ou resolver)",
        "allowedTypes": [
          "Personagem",
          "Objeto",
          "Evento"
        ]
      },
      {
        "role": "1ª Localidade da rota",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Encontro na 1ª Localidade",
        "allowedTypes": [
          "Personagem",
          "Ameaça",
          "Evento"
        ]
      },
      {
        "role": "2ª Localidade da rota",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Encontro na 2ª Localidade",
        "allowedTypes": [
          "Personagem",
          "Ameaça",
          "Evento"
        ]
      },
      {
        "role": "Destino Final da Jornada",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Clímax no Destino Final",
        "allowedTypes": [
          "Personagem",
          "Ameaça",
          "Evento"
        ]
      }
    ]
  },
  {
    "id": "enredo-5",
    "pdfPage": 5,
    "category": "Enredo",
    "title": "Resgate",
    "description": "Algo ou alguém está guardado ou preso em território inimigo. A missão do grupo é infiltrar esse terreno hostil, libertar ou recuperar o objetivo e escapar com vida — sendo a volta ainda mais perigosa que a ida.",
    "nimbSlots": [
      {
        "role": "Alvo do Resgate (prisioneiro ou relíquia)",
        "allowedTypes": [
          "Personagem",
          "Objeto"
        ]
      },
      {
        "role": "Local de passagem / entrada do território hostil",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Cativeiro / Cofre onde o objetivo está preso",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Perigo na Ida (Guarda Externa)",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Perigo na Ida (Defesa Interna)",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Perigo na Fuga (Alarme / Perseguidores)",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Chefe / Obstáculo Final na saída",
        "allowedTypes": [
          "Ameaça"
        ]
      }
    ]
  },
  {
    "id": "enredo-6",
    "pdfPage": 6,
    "category": "Enredo",
    "title": "Perseguição",
    "description": "Há dois lados: um tenta fugir e o outro está em seu encalço. Movimentação e pressão constante a cada cena até o confronto decisivo no último trecho.",
    "nimbSlots": [
      {
        "role": "Presa ou Perseguidor Implacável",
        "allowedTypes": [
          "Personagem",
          "Ameaça"
        ]
      },
      {
        "role": "Motivo da Perseguição (posse ou segredo)",
        "allowedTypes": [
          "Objeto",
          "Evento"
        ]
      },
      {
        "role": "1º Trecho da Perseguição",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "2º Trecho da Perseguição",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Último Trecho / Refúgio Final",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Obstáculo ou Possível Traidor no caminho",
        "allowedTypes": [
          "Personagem",
          "Evento"
        ]
      }
    ]
  },
  {
    "id": "enredo-7",
    "pdfPage": 7,
    "category": "Enredo",
    "title": "Conflito de Facções",
    "description": "Duas ou mais facções num mesmo local estão prestes a se enfrentar. O início envolve investigação, alianças e preparação; o clímax é a batalha ou resolução do conflito.",
    "nimbSlots": [
      {
        "role": "Líder da Facção A",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Forças / Capangas da Facção A",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Líder da Facção B",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Forças / Capangas da Facção B",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Motivo da disputa (domínio de território ou posse)",
        "allowedTypes": [
          "Local",
          "Objeto"
        ]
      }
    ]
  },
  {
    "id": "enredo-8",
    "pdfPage": 8,
    "category": "Enredo",
    "title": "Diplomacia & Intriga",
    "description": "Um problema que não pode ser solucionado por força bruta: um julgamento, conselho de nobres, tratado de paz ou grande baile onde violência colocaria tudo a perder.",
    "nimbSlots": [
      {
        "role": "Objetivo da Diplomacia (inocentar, obter ou resolver)",
        "allowedTypes": [
          "Personagem",
          "Objeto",
          "Evento"
        ]
      },
      {
        "role": "Opositor Político / Acusador 1",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Opositor Político / Rival 2",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Local Neutro ou Salão do Encontro",
        "allowedTypes": [
          "Local"
        ]
      },
      {
        "role": "Complicação nos bastidores",
        "allowedTypes": [
          "Evento",
          "Ameaça"
        ]
      }
    ]
  },
  {
    "id": "enredo-9",
    "pdfPage": 9,
    "category": "Enredo",
    "title": "Mistério & Investigação",
    "description": "Ocorreu um crime, roubo, maldição ou evento inexplicável. O dever dos heróis é interrogar suspeitos, reunir provas nas cenas e desmascarar o verdadeiro culpado.",
    "nimbSlots": [
      {
        "role": "O Crime / Mistério a ser solucionado",
        "allowedTypes": [
          "Personagem",
          "Objeto",
          "Evento"
        ]
      },
      {
        "role": "O Verdadeiro Culpado (Mente Criminosa)",
        "allowedTypes": [
          "Personagem"
        ]
      },
      {
        "role": "Capangas / Executores do Culpado",
        "allowedTypes": [
          "Ameaça"
        ]
      },
      {
        "role": "Pista 1 (Testemunha, Prova ou Cena)",
        "allowedTypes": [
          "Personagem",
          "Local",
          "Objeto"
        ]
      },
      {
        "role": "Pista 2 (Testemunha, Prova ou Cena)",
        "allowedTypes": [
          "Personagem",
          "Local",
          "Objeto"
        ]
      },
      {
        "role": "Pista 3 / Reviravolta na Investigação",
        "allowedTypes": [
          "Personagem",
          "Local",
          "Objeto"
        ]
      }
    ]
  },
  {
    "id": "personagem-10",
    "pdfPage": 10,
    "category": "Personagem",
    "title": "Autoridade",
    "description": "Seu papel é mandar — poder político, econômico, militar ou religioso. Administra um domínio (reino, caravana, guilda, templo). Como aliada fornece recursos; como vilã envia exércitos e capangas.",
    "examples": [
      "Iniciante: Barão do Reinado (humano severo, mas justo)",
      "Veterano: Dama do Bosque (dahllan líder de seita druídica)",
      "Campeão: Lorde dos Ossos (osteon necromante refinado)",
      "Lenda: Princesa Mercante (hynne dona de frota comercial)"
    ]
  },
  {
    "id": "personagem-11",
    "pdfPage": 11,
    "category": "Personagem",
    "title": "Aliado",
    "description": "Figura confiável em pé de igualdade com os heróis. Se surgir como oponente, pode estar sob controle mental, chantagem ou competindo de forma honrada num torneio.",
    "examples": [
      "Iniciante: Acólito Abençoado (aggelus curandeiro prestativo)",
      "Veterano: Artífice Ambulante (kliren disposto a emprestar engenhocas)",
      "Campeão: Capitã da Guarda (anã rabugenta, mas leal aos heróis)",
      "Lenda: Estudiosa Idealista (elfa maga que apoia o grupo)"
    ]
  },
  {
    "id": "personagem-12",
    "pdfPage": 12,
    "category": "Personagem",
    "title": "Rival",
    "description": "Alguém em pé de igualdade com o grupo e oposto a eles — compete pelas mesmas missões/tesouros ou é o braço direito do vilão. Pode propor trégua temporária contra um mal maior.",
    "examples": [
      "Iniciante: Cavaleiro Fanático (humano honrado, mas inflexível)",
      "Veterano: Espiã Enganadora (qareen agente de facção rival)",
      "Campeão: Pesquisador Obcecado (golem que busca relíquias a qualquer custo)",
      "Lenda: Sargento Corrupto (minotauro influente na guarda)"
    ]
  },
  {
    "id": "personagem-13",
    "pdfPage": 13,
    "category": "Personagem",
    "title": "Protegido",
    "description": "Alguém incapaz de lidar sozinho com o perigo e que sofrerá um destino terrível a menos que os aventureiros intervenham e o escoltem/protejam.",
    "examples": [
      "Iniciante: Goblin Órfão (verde, verruguento e sem ninguém para cuidar)",
      "Veterano: Medusa Perseguida (bondosa, caçada injustamente)",
      "Campeão: Nobre Envenenado (morrerá se o antídoto não for obtido)",
      "Lenda: Sereia Encalhada (jovem perdida no mundo seco)"
    ]
  },
  {
    "id": "personagem-14",
    "pdfPage": 14,
    "category": "Personagem",
    "title": "Mentor",
    "description": "Ensina, aconselha e envia os heróis em missões. Pode ser o antigo mestre de um personagem ou até o preceptor severo do vilão.",
    "examples": [
      "Iniciante: Fada Sabichona (sílfide centenária, sábia e provocadora)",
      "Veterano: Mordomo Leal (osteon que continua servindo a família após a morte)",
      "Campeão: Parente Veterano (pai, mãe ou tio aventureiro aposentado)",
      "Lenda: Professor Recluso (lefou eremita detentor de segredos contra a Tormenta)"
    ]
  },
  {
    "id": "personagem-15",
    "pdfPage": 15,
    "category": "Personagem",
    "title": "Profeta",
    "description": "Voz dos deuses ou do destino. Conectado a forças além do alcance mortal, mas sempre exige um preço, provação ou enigma para revelar o futuro.",
    "examples": [
      "Iniciante: Avatar de Valkaria encontrada no fundo de uma masmorra",
      "Veterano: Ente Dorminhoco que só acorda e responde perguntas um dia por ano",
      "Campeão: Fantasma Vidente que exige sacrifício para ser invocado",
      "Lenda: Trog Ancião isolado no topo de uma montanha gelada"
    ]
  },
  {
    "id": "personagem-16",
    "pdfPage": 16,
    "category": "Personagem",
    "title": "Bufão",
    "description": "Aponta o ridículo em volta dos heróis e diz verdades que ninguém mais aceita. Ignorado pelos poderosos por parecer tolo, descobre segredos valiosos (ou usa a tolice como fachada astuta).",
    "examples": [
      "Iniciante: Arquimago Bêbado (anão imprevisível nas magias)",
      "Veterano: Barda Desafinada (qareen difícil de aturar, porém cheia de contatos)",
      "Campeão: Dragão Poeta (temível na aparência, mas pacífico e artístico)",
      "Lenda: Velhinha Míope (avatar de Tanna-Toh fazendo comentários sinceros)"
    ]
  },
  {
    "id": "personagem-17",
    "pdfPage": 17,
    "category": "Personagem",
    "title": "Capanga",
    "description": "Subserviente, mas relevante na trama — só quer sobreviver e receber seu pagamento. Se capturado ou bem tratado, pode entregar informações do covil ou mudar de lado.",
    "examples": [
      "Iniciante: Lacaio Puxa-saco (hynne que não desgruda do chefe)",
      "Veterano: Escudeiro Goblin (mais esperto que o próprio patrão)",
      "Campeão: Aprendiz de Mago (planejando roubar o grimório do mestre e fugir)",
      "Lenda: Ama Severa (administra o castelo inteiro e possui todas as chaves)"
    ]
  },
  {
    "id": "personagem-18",
    "pdfPage": 18,
    "category": "Personagem",
    "title": "Ídolo",
    "description": "Figura lendária admirada pelos heróis — mais famoso, poderoso ou honrado. Ocupado com façanhas épicas, até o dia em que os heróis falam com ele de igual para igual ou precisam salvá-lo.",
    "examples": [
      "Iniciante: Arquimago Planar (sempre viajando entre os Mundos dos Deuses)",
      "Veterano: Escolhida Divina (carrega a marca sagrada de um deus do Panteão)",
      "Campeão: Lenda Aposentada (velho herói que só quer paz)",
      "Lenda: Tirana Honrada (deseja conquistar o mundo, mas jamais mente ou age com covardia)"
    ]
  },
  {
    "id": "personagem-19",
    "pdfPage": 19,
    "category": "Personagem",
    "title": "Entidade",
    "description": "Força incompreensível (avatar divino, Lorde da Tormenta, ser extraplanar) perante a qual os mortais são peões. Não pode ser vencida na força bruta — deve ser negociada, apaziguada ou evitada.",
    "examples": [
      "Iniciante: Juiz Eterno (avatar de Khalmyr julgando os atos do grupo)",
      "Veterano: Lekael Curioso (Lorde da Tormenta observando o comportamento mortal)",
      "Campeão: Montanha Senciente (para quem mortais são formigas)",
      "Lenda: O Jogador (imortal que faz apostas com o destino de aventureiros)"
    ]
  },
  {
    "id": "ameaca-20",
    "pdfPage": 20,
    "category": "Ameaça",
    "title": "Clérigos & Celestiais",
    "description": "Representantes do poder dos deuses: sacerdotes fanáticos, paladinos, criaturas abissais invocadas ou guardiões divinos de templos sagrados/profanos.",
    "bestiaryCategories": [
      "Igreja de Arsenal",
      "Igreja de Kallyadranoch",
      "Culto de Aharadak",
      "Sszzaazitas",
      "Livro Básico"
    ],
    "examples": [
      "Iniciante: Cão do inferno, capelão de guerra, centauro xamã, guerreiro de chifres",
      "Veterano: Cultista de Sszzaas, sacerdote de Aharadak, bispo de guerra",
      "Campeão: Alto clérigo de Kally, kishin, forjador litúrgico, armadilha símbolo da morte",
      "Lenda: Avatar de Aharadak, Avatar de Kallyadranoch, Kishinauros"
    ]
  },
  {
    "id": "ameaca-21",
    "pdfPage": 21,
    "category": "Ameaça",
    "title": "Arcanistas & Mágicos",
    "description": "Conjuradores arcanos, golens, criaturas místicas inteligentes, inventores e armadilhas ou anomalias arcanas.",
    "bestiaryCategories": [
      "Golens",
      "Trolls Nobres (Finntroll)",
      "Supremacia Purista",
      "Sszzaazitas",
      "Livro Básico"
    ],
    "examples": [
      "Iniciante: Goblin engenhoqueiro, minauro arcanista, arcano de guerra adepto, soldado mecânico",
      "Veterano: Nagah mística, golem de carne, golem de bronze, golem de ferro",
      "Campeão: Arcanista finntroll, bruxa goblin, golem de pedra, brawar",
      "Lenda: Arquibruxo da Tormenta, lich, golem de matéria vermelha"
    ]
  },
  {
    "id": "ameaca-22",
    "pdfPage": 22,
    "category": "Ameaça",
    "title": "Criminosos & Mercenários",
    "description": "Bandidos de estrada, piratas, pistoleiros, guildas de ladrões, devotos de Hyninn e conspiradores sszzaazitas.",
    "bestiaryCategories": [
      "Capangas & Bandoleiros",
      "Piratas & Pistoleiros",
      "Sszzaazitas",
      "Livro Básico"
    ],
    "examples": [
      "Iniciante: Bandido, capanga, chefe bandido, gatuno, pirata, pistoleiro",
      "Veterano: Chefe de quadrilha, duplo, sacerdote de Hyninn, capitão pirata",
      "Campeão: Chapéu-preto, demônio da pólvora, mercenário de Aslothia",
      "Lenda: Lobo do Mar, sszzaazita celebrante, Nastarrath"
    ]
  },
  {
    "id": "ameaca-23",
    "pdfPage": 23,
    "category": "Ameaça",
    "title": "Dragões & Servos de Kally",
    "description": "Dragões cromáticos, dragões menores/reais, kobolds, kallyanach e cultistas do Terceiro.",
    "bestiaryCategories": [
      "Dragões",
      "Igreja de Kallyadranoch",
      "Kobolds",
      "Livro Básico"
    ],
    "examples": [
      "Iniciante: Kobold patrulheiro, cão de Kally, acólito de Kally, dragão filhote",
      "Veterano: Dracomante, kallyanach bárbaro, dragão jovem, cavaleiro de Kally",
      "Campeão: Dragão adulto, dragão feral, dragão bicéfalo, kobold-mãe",
      "Lenda: Dragão venerável, Dragão-Real, Sckhar (Dragão-Rei do Fogo)"
    ]
  },
  {
    "id": "ameaca-24",
    "pdfPage": 24,
    "category": "Ameaça",
    "title": "Duyshidakk & Goblinoides",
    "description": "Tropas da Aliança Negra / Akzath, engenhos de guerra goblins, bugbears assassinos e comandantes hobgoblins.",
    "bestiaryCategories": [
      "Duyshidakk",
      "Livro Básico"
    ],
    "examples": [
      "Iniciante: Goblin salteador, bugbear sentinela, goblin-bomba",
      "Veterano: Gangue goblin, goblin de ferro, hobgoblin atirador, bugbear guarda-costas",
      "Campeão: Bruxa goblin, hobgoblin comandante tático, horda goblin",
      "Lenda: Hobgoblin gladiador, Sangue de Ayrrak"
    ]
  },
  {
    "id": "ameaca-25",
    "pdfPage": 25,
    "category": "Ameaça",
    "title": "Espíritos da Natureza & Elementais",
    "description": "Elementais da água, ar, fogo e terra, entes, criaturas feéricas e guardiões furiosos das matas.",
    "bestiaryCategories": [
      "Elementais",
      "Ermos",
      "Mundo Perdido (Galrasia)",
      "Povos-Trovão"
    ],
    "examples": [
      "Iniciante: Pakk, t’peel, terrier, aquin’ne, unicórnio",
      "Veterano: Corgann, rarvnaak, ber-baram, pamgra, ente, carrasco de Lena",
      "Campeão: Tanaloom, namasqall, serpentaar, hallus’tir, árvore-matilha",
      "Lenda: Elemental corrompido, Totens do Trovão"
    ]
  },
  {
    "id": "ameaca-26",
    "pdfPage": 26,
    "category": "Ameaça",
    "title": "Feras & Monstros Selvagens",
    "description": "Predadores famintos, dinossauros de Galrasia, feras das Montanhas Sanguinárias e Uivantes, monstros de masmorra.",
    "bestiaryCategories": [
      "Montarias & Feras",
      "Masmorras",
      "Ermos",
      "Montanhas Sanguinárias",
      "Montanhas Uivantes",
      "Mundo Perdido (Galrasia)",
      "Sob as Ondas"
    ],
    "examples": [
      "Iniciante: Lobo, gorlogg, pantera, tigre, urso pardo, glop, cocatriz",
      "Veterano: Bulette, quimera, mantícora, serpe, tigre-de-Hyninn, mamute",
      "Campeão: Rei-tirano, grande battham, verme do gelo, kraken",
      "Lenda: Razza’kham, Kaiju, Rhandomm"
    ]
  },
  {
    "id": "ameaca-27",
    "pdfPage": 27,
    "category": "Ameaça",
    "title": "Humanoides & Impérios Hostis",
    "description": "Batalhões da Supremacia Purista, legiões do Império de Tauron, bandos gnolls, orcs, ogros e finntrolls.",
    "bestiaryCategories": [
      "Supremacia Purista",
      "Império de Tauron",
      "Brutos & Indomáveis",
      "Gnolls",
      "Trolls Nobres (Finntroll)",
      "Império de Jade"
    ],
    "examples": [
      "Iniciante: Orc chefe, trog, gnoll saqueador, legionário, purificado",
      "Veterano: Ogro, dançarino de guerra, soldado blindado, gnoll líder de alcateia, finntroll feitor",
      "Campeão: Gladiador táurico, matrona gnoll, cavaleiro finntroll, companhia blindada",
      "Lenda: Gnoll Vuul’rak, soldado superior purista"
    ]
  },
  {
    "id": "ameaca-28",
    "pdfPage": 28,
    "category": "Ameaça",
    "title": "Lefeu & Culto da Tormenta",
    "description": "Demônios insetoides da Tempestade Rubra, aberrantes corrompidos e cultistas profanos de Aharadak.",
    "bestiaryCategories": [
      "Áreas de Tormenta",
      "Culto de Aharadak"
    ],
    "examples": [
      "Iniciante: Infecto, iniciado da agonia, uktril, maníaco lefou",
      "Veterano: Fanático lefou, zyrrinaz, geraktril, bruxo da Tormenta, veridak, reishid",
      "Campeão: Aspecto de Aharadak, hurobakk, burodron, morgadrel, esmagador coletivo",
      "Lenda: Ezzayn, thuwarokk, Senhor do Gigante Rubro, Gatzvalith (Lorde da Tormenta)"
    ]
  },
  {
    "id": "ameaca-29",
    "pdfPage": 29,
    "category": "Ameaça",
    "title": "Mortos-Vivos & Aslothia",
    "description": "Esqueletos, carniçais, fantasmas, múmias, necrodracos e os senhores necromantes do Reino dos Mortos.",
    "bestiaryCategories": [
      "Mortos-Vivos",
      "Reino dos Mortos (Aslothia)",
      "Livro Básico"
    ],
    "examples": [
      "Iniciante: Garra-zumbi, carniçal, chacal-zumbi, lívido, ogro esqueleto",
      "Veterano: Múmia, fantasma, wisphago, morgue’raz",
      "Campeão: Alzeras, mortalha, necrodraco esqueleto/zumbi, senhor das múmias",
      "Lenda: Lich de Aslothia, cemitério vivo, necrodraco lich, Tarso, Arquilich Ferren Asloth"
    ]
  },
  {
    "id": "local-30",
    "pdfPage": 30,
    "category": "Local",
    "title": "Urbano",
    "description": "Povoamentos, bairros sombrios, palácios reais e metrópoles planares.",
    "examples": [
      "Iniciante: Aldeia Remota (choupanas de sapê longe de qualquer guarnição)",
      "Veterano: Armazém Desocupado (galpão lacrado com tábuas que esconde atividades escusas)",
      "Campeão: Palácio Imperial (salões de mármore protegidos por guardas de elite e golens)",
      "Lenda: Metrópole Planar (cidade no Reino dos Deuses fervilhando de seres e itens mágicos)"
    ]
  },
  {
    "id": "local-31",
    "pdfPage": 31,
    "category": "Local",
    "title": "Fortificação",
    "description": "Estruturas militares defensivas, castelos feudais e máquinas de guerra.",
    "examples": [
      "Iniciante: Torre de Vigia (três andares de pedra cinzenta com fumaça na chaminé)",
      "Veterano: Castelo Baronial (muralha alta, pátio, sala do trono e calabouços)",
      "Campeão: Muralha Fantasmagórica (ruína ancestral guarnecida por espíritos eternos)",
      "Lenda: Fortaleza Móvel (colosso militar purista movido a vapor e magia)"
    ]
  },
  {
    "id": "local-32",
    "pdfPage": 32,
    "category": "Local",
    "title": "Rural",
    "description": "Propriedades agrícolas, villas nobres afastadas e domínios feéricos.",
    "examples": [
      "Iniciante: Fazenda Subjugada (tomada por bandidos ou monstros com reféns no celeiro)",
      "Veterano: Villa Corrupta (propriedade murada de governador dissidente tapistano)",
      "Campeão: Corte Feérica (círculo de pedras que leva a palácios de cristal no crepúsculo eterno)",
      "Lenda: Castelo nas Nuvens (fortaleza titânica de gigantes flutuando no céu)"
    ]
  },
  {
    "id": "local-33",
    "pdfPage": 33,
    "category": "Local",
    "title": "Ermos Selvagens",
    "description": "Matas fechadas, pântanos venenosos, cordilheiras geladas ou vulcânicas.",
    "examples": [
      "Iniciante: Floresta Sombria (copas que bloqueiam o sol, raízes largas e teias de aranha)",
      "Veterano: Pântano Funesto (água turva e fétida repleta de répteis e gosmas)",
      "Campeão: Cadeia de Montanhas (desfiladeiros das Uivantes ou Sanguinárias)",
      "Lenda: Meteoro Vagante (rocha flutuante no Éter abalada por gêiseres e seres alienígenas)"
    ]
  },
  {
    "id": "local-34",
    "pdfPage": 34,
    "category": "Local",
    "title": "Fronteiras",
    "description": "Caminhos isolados longe das patrulhas do Reinado e terras desoladas.",
    "examples": [
      "Iniciante: Estrada Afastada (bloqueada por árvores caídas para emboscada)",
      "Veterano: Vastidão Desolada (terra seca e morta drenada por alguma entidade)",
      "Campeão: Confins de Arton (tundras não mapeadas onde o frio é tão letal quanto os monstros)",
      "Lenda: Éter Entre Mundos (o mar de estrelas gelado entre Arton e os Planos)"
    ]
  },
  {
    "id": "local-35",
    "pdfPage": 35,
    "category": "Local",
    "title": "Subterrâneo",
    "description": "Grutas naturais, masmorras mortais e cidades nas profundezas.",
    "examples": [
      "Iniciante: Caverna Ocupada (gruta úmida com ecos de bandidos ou feras no fundo)",
      "Veterano: Calabouço da Morte (labirinto de armadilhas, fossos e paredes esmagadoras)",
      "Campeão: Cidadela Finntroll (palacetes subterrâneos e laboratórios bioarcanos)",
      "Lenda: Fenda para o Vazio (rasgo na realidade para onde o tempo e a vida nunca surgiram)"
    ]
  },
  {
    "id": "local-36",
    "pdfPage": 36,
    "category": "Local",
    "title": "Lar de Vilão",
    "description": "Quartéis-generais, acampamentos fortificados e fortalezas do mal.",
    "examples": [
      "Iniciante: Esconderijo de Bandidos (choupana antiga no bosque nos arredores da cidade)",
      "Veterano: Acampamento de Humanoides (paliçada de madeira, tendas de peles e totem sangrento)",
      "Campeão: Base Purista (bunker de concreto com torres de vigia e alarmes mágicos)",
      "Lenda: Palácio Demoníaco (rocha negra cercada por fosso de chamas)"
    ]
  },
  {
    "id": "local-37",
    "pdfPage": 37,
    "category": "Local",
    "title": "Covil de Monstros",
    "description": "Ninhos e tocas das feras mais letais de Arton.",
    "examples": [
      "Iniciante: Poço Gosmento (poço corrosivo de onde brotam glops famintos)",
      "Veterano: Toca de Predador (gruta na encosta cercada por ossadas semidevoradas)",
      "Campeão: Ninho de Monstro Voador (topo de penhasco íngreme de grifo ou wyvern)",
      "Lenda: Covil Dracônico (câmara vulcânica no coração da montanha forrada de ouro)"
    ]
  },
  {
    "id": "local-38",
    "pdfPage": 38,
    "category": "Local",
    "title": "Local Arcano",
    "description": "Oficinas alquímicas, bibliotecas encantadas e torres de arquimagos.",
    "examples": [
      "Iniciante: Laboratório de Alquimista (oficina abarrotada de frascos, reagentes e alambiques)",
      "Veterano: Biblioteca Mágica (salão com bibliotecários esqueletos e monstros saídos de livros)",
      "Campeão: Torre de Arquimago (protegida por muralhas elementais e objetos animados)",
      "Lenda: Nexo Planar (plataforma flutuante com portais instáveis para outros mundos)"
    ]
  },
  {
    "id": "local-39",
    "pdfPage": 39,
    "category": "Local",
    "title": "Local Divino / Profano",
    "description": "Alçapões cultistas, templos sombrios e fendas abissais.",
    "examples": [
      "Iniciante: Santuário Cultista (subsolo de armazém iluminado por braseiros e altar profano)",
      "Veterano: Templo Profano (colunas de crânios, patrulhas de zumbis e cânticos sinistros)",
      "Campeão: Catedral Maligna (bacias de sangue e energia negativa congelante)",
      "Lenda: Abismo Demoníaco (fenda fumegante que cospe chamas e uivos infernais)"
    ]
  },
  {
    "id": "local-40",
    "pdfPage": 40,
    "category": "Local",
    "title": "Ruínas",
    "description": "Vestígios de civilizações antigas, minas abandonadas e relíquias caídas.",
    "examples": [
      "Iniciante: Cripta Abandonada (construção fria de pedra tomada por aranhas e mortos)",
      "Veterano: Mina Invadida (galerias anãs com trilhos de ferro e pedras preciosas intactas)",
      "Campeão: Nave Voadora Caída (nau de madeira e vidro vinda de além de Arton)",
      "Lenda: Mundo Desconhecido (fragmento de mundo destruído vagando pelo Éter)"
    ]
  },
  {
    "id": "local-41",
    "pdfPage": 41,
    "category": "Local",
    "title": "Infestações",
    "description": "Locais tomados por pragas, mortos-vivos ou pela própria Tempestade Rubra.",
    "examples": [
      "Iniciante: Porão Infestado (sala escura entre caixotes e barris onde algo espreita)",
      "Veterano: Esgotos Pútridos (túneis cobertos de limo que conectam toda a cidade)",
      "Campeão: Necrópole Assombrada (labirinto de mausoléus envolto em névoa e espectros)",
      "Lenda: Área de Tormenta (pesadelo aberrante de chuva ácida, matéria vermelha e lefeu)"
    ]
  },
  {
    "id": "objeto-42",
    "pdfPage": 42,
    "category": "Objeto",
    "title": "Armas & Armaduras",
    "description": "Uma arma ou armadura superior ou mágica — pode ser a peça do crime, herança roubada ou recompensa pela missão.",
    "examples": [
      "Iniciante: Arma ou armadura superior (1 ou 2 modificações)",
      "Veterano: Arma/armadura superior (1d4+1 modificações) ou Arma mágica (1 encanto)",
      "Campeão: Arma/armadura superior e mágica (1d4+1 modificações e 1 encanto)",
      "Lenda: Arma ou armadura lendária (1d3+3 modificações e 1d3+1 encantos)"
    ]
  },
  {
    "id": "objeto-43",
    "pdfPage": 43,
    "category": "Objeto",
    "title": "Riquezas",
    "description": "Joias, relíquias reais e cofres que podem ser vendidos pelo valor integral (ou role no nosso Sorteador de Tesouros!).",
    "examples": [
      "Iniciante: Torque de ouro bárbaro (T$ 1.000), Algibeira de guilda (T$ 2.000), Colar de pérolas (T$ 4.000)",
      "Veterano: Ídolo de ouro (T$ 6.500), Baú de moedas anãs (T$ 10.000), Anel de mitral (T$ 25.000)",
      "Campeão: Lingotes de adamante (T$ 20.000), Carroça de tributos reais (T$ 50.000), Joias élficas (T$ 80.000)",
      "Lenda: Colar de lágrimas de anjo (T$ 40.000), Cofre de sultão planar (T$ 100.000), Coroa de Ghondriann (T$ 200.000)"
    ]
  },
  {
    "id": "objeto-44",
    "pdfPage": 44,
    "category": "Objeto",
    "title": "Mercadorias & Propriedades",
    "description": "Cargas valiosas, escrituras e navios que exigem encontrar o comprador certo (ou servem de base para o grupo!).",
    "examples": [
      "Iniciante: Caixote de gorad (T$ 900), Barril de vinho élfico de Lenórienn (T$ 3.150), Carroça de seda (T$ 4.000)",
      "Veterano: Coleção de tomos (T$ 6.400), Arca de peças de engenhocas (T$ 22.400), Escritura de uma Torre (T$ 38.400)",
      "Campeão: Navio Mercante (T$ 20.000), Baú de cristais arcanos (T$ 68.000), Carta régia de posse de um Feudo (T$ 117.600)",
      "Lenda: Especiarias planares (T$ 36.100), Vestido de avatar de Marah (T$ 126.000), Navio Voador (T$ 250.000)"
    ]
  },
  {
    "id": "objeto-45",
    "pdfPage": 45,
    "category": "Objeto",
    "title": "Quinquilharias Curiosas (1d20)",
    "description": "Objetos exóticos sem valor comercial aparente, mas cheios de ganchos de história.",
    "examples": [
      "1-5: Jarro com 4d10 olhos | Vela que nunca apaga | Panela hynne | Medalha de ordem extinta | Engrenagem misteriosa",
      "6-10: Diário de princesa | Noz de dríade | Urna com cinzas de vilão | Tapeçaria da Grande Batalha | Discursos tapistanos",
      "11-15: Boneca de pano que fala | Caneca que esfria bebida | Anel de amantes proibidos | Convite de baile nobre | Cabo de espada mágica",
      "16-20: Pintura de antigo rei | Chifres de general táurico | Martelo anão | Frasco com sangue de dragão | Uma roda de queijo"
    ]
  },
  {
    "id": "objeto-46",
    "pdfPage": 46,
    "category": "Objeto",
    "title": "Mercado Clandestino",
    "description": "Itens proibidos no Reinado: pólvora, achbuld, venenos letais e segredos de Estado.",
    "examples": [
      "Iniciante: Arma de fogo superior (1 mod.), Barril de achbuld (T$ 1.500), Veneno (1d3 doses)",
      "Veterano: Arma de fogo superior (1d4+1 mods.), Carroça de achbuld (T$ 15.000), Veneno raro",
      "Campeão: Arma de fogo mágica, Anel de sinete do Conselho-Mor, Ordens militares secretas",
      "Lenda: Chave do cofre do Palácio Imperial, Rubi da Virtude"
    ]
  },
  {
    "id": "objeto-47",
    "pdfPage": 47,
    "category": "Objeto",
    "title": "Itens Mágicos & Poções",
    "description": "Poções, pergaminhos, acessórios encantados e artefatos.",
    "examples": [
      "Iniciante: 1 poção, 1 pergaminho ou Caixinha de madeira com 1d4+1 poções",
      "Veterano: Baú com 1d6+3 poções, Bornal com 1d4+1 pergaminhos ou Acessório mágico menor",
      "Campeão: Acessório mágico médio ou Acessório mágico maior",
      "Lenda: Dois acessórios maiores relacionados ou 1 Artefato lendário"
    ]
  },
  {
    "id": "evento-48",
    "pdfPage": 48,
    "category": "Evento",
    "title": "Acidente",
    "description": "Algo dá errado na pior hora possível sem que ninguém tenha culpa: naufrágio, ponte caída, carroça quebrada ou equipamento danificado.",
    "examples": [
      "Use como um desafio ambiental autocontido que exige improviso e perícias práticas."
    ]
  },
  {
    "id": "evento-49",
    "pdfPage": 49,
    "category": "Evento",
    "title": "Anomalia Sobrenatural",
    "description": "Fenômeno mágico bizarro: zona de magia morta, gravidade invertida, mansão maior por dentro que por fora, loop temporal ou troca de corpos.",
    "examples": [
      "Força os jogadores a saírem da zona de conforto e investigarem a causa mística."
    ]
  },
  {
    "id": "evento-50",
    "pdfPage": 50,
    "category": "Evento",
    "title": "Celebração",
    "description": "O local está em festa: festival da colheita, coroação, casamento real, torneio de justa ou feriado religioso com multidões e estrangeiros.",
    "examples": [
      "Cenário perfeito para encontros sociais, pequenos furtos, competições ou atentados durante a festa."
    ]
  },
  {
    "id": "evento-51",
    "pdfPage": 51,
    "category": "Evento",
    "title": "Dádiva",
    "description": "Um momento genuíno de gratidão e auxílio: cura gratuita de um templo, herança inesperada, banquete em honra aos heróis ou presente de um NPC salvo.",
    "examples": [
      "Fortalece os laços entre os aventureiros e os habitantes de Arton."
    ]
  },
  {
    "id": "evento-52",
    "pdfPage": 52,
    "category": "Evento",
    "title": "Fenômeno Natural",
    "description": "A fúria da natureza: tempestade torrencial, avalanche nas Uivantes, tempestade de areia, incêndio florestal ou erupção.",
    "examples": [
      "Use Perigos Complexos (Avalanche ND 4, Tempestade em Alto Mar ND 6) ou modifique o terreno do combate."
    ]
  },
  {
    "id": "evento-53",
    "pdfPage": 53,
    "category": "Evento",
    "title": "Guerra",
    "description": "Dois exércitos se enfrentando, uma cidade sitiada, fronteiras bloqueadas ou sobreviventes de um massacre militar.",
    "examples": [
      "Obriga o grupo a agir estrategicamente (infiltrar o cerco, sabotar suprimentos, resgatar civis)."
    ]
  },
  {
    "id": "evento-54",
    "pdfPage": 54,
    "category": "Evento",
    "title": "Negociação",
    "description": "Os heróis precisam de algo que um NPC possui e o combate não é opção: leilão arcano, tratado diplomático, pedágio ou barganha com entidade.",
    "examples": [
      "Cada lado quer ceder o mínimo possível; exige interpretação e escolhas difíceis."
    ]
  },
  {
    "id": "evento-55",
    "pdfPage": 55,
    "category": "Evento",
    "title": "Praga",
    "description": "Uma doença mágica, maldição ou veneno contamina a região (ou os próprios heróis). Não pode ser vencida com espadas — exige descobrir a origem ou a cura.",
    "examples": [
      "Exemplos: Calafrio Diabólico, Febre do Riso, Maldição Pegajosa ou corrupção rubra."
    ]
  },
  {
    "id": "evento-56",
    "pdfPage": 56,
    "category": "Evento",
    "title": "Presença Divina",
    "description": "Um deus do Panteão (ou seu arauto/sinal milagroso) manifesta interesse direto nos eventos da aventura.",
    "examples": [
      "Traz um sentimento de grandiosidade épica e transcendência à sessão."
    ]
  },
  {
    "id": "evento-57",
    "pdfPage": 57,
    "category": "Evento",
    "title": "Traição",
    "description": "Alguém em quem os aventureiros confiavam se volta contra eles (ou testemunham uma traição chocante entre aliados importantes).",
    "examples": [
      "Quebra o sentimento de segurança e muda os rumos da campanha."
    ]
  }
];

export const RANDOM_ENCOUNTER_TABLES: RandomEncounterTable[] = [
  {
    "id": "estradas",
    "name": "Estradas do Reinado (Deheon, Bielefeld, Wynlla, Zakharov)",
    "pdfPage": 431,
    "entries": [
      [
        1,
        2,
        "Uma taverna de estrada lotada de viajantes e boatos"
      ],
      [
        3,
        6,
        "1 pirata vendendo um mapa do tesouro (falso)"
      ],
      [
        7,
        10,
        "4 bandidos comuns tentam cobrar pedágio/roubar o grupo"
      ],
      [
        11,
        20,
        "2 guardas de cidade patrulhando a estrada real"
      ],
      [
        21,
        30,
        "1 chefe bandido e 2 capangas de tocaia"
      ],
      [
        31,
        35,
        "1 sacerdote de Hyninn em forma de macaco pungando algo valioso do grupo"
      ],
      [
        36,
        40,
        "1 grifo atacando o cavalo de um mercador"
      ],
      [
        41,
        50,
        "2 gorloggs fugindo assustados"
      ],
      [
        51,
        60,
        "1 ogro guardando uma ponte e cobrando pedágio de T$ 15 por pessoa"
      ],
      [
        61,
        65,
        "1 bugbear sentinela e 4 goblins salteadores"
      ],
      [
        66,
        70,
        "1 gangue goblin saqueando uma carroça"
      ],
      [
        71,
        80,
        "3 goblins de sombreiro escondidos"
      ],
      [
        81,
        90,
        "1 chefe de quadrilha, 1 capanga minotauro e 2 jagunços"
      ],
      [
        91,
        98,
        "1 líder pistoleiro e 3 pistoleiros"
      ],
      [
        99,
        100,
        "Caravana de mercadores (vende itens com até 2 melhorias) escoltada por 4 capangas minotauros"
      ],
      [
        101,
        110,
        "2 altos sacerdotes de Hyninn recolhendo \"doações\" para sua igreja"
      ],
      [
        111,
        115,
        "1 gnoll caçador de cabeças, 1 bugbear guarda-costas e 1 ogro caçador"
      ],
      [
        116,
        125,
        "1 dragão bicéfalo sobrevoando a estrada"
      ],
      [
        126,
        130,
        "1d4+1 golens de bronze transportando 1d3+1 riquezas médias roubadas"
      ],
      [
        131,
        135,
        "Grama carnívora extensa bloqueando a rota"
      ],
      [
        136,
        145,
        "1 devorador de medos e 2 bruxas goblins"
      ],
      [
        146,
        150,
        "1 hobgoblin gladiador desafiando viajantes"
      ],
      [
        151,
        155,
        "1 dragão celestial adulto tentando capturar 3 kaijin ninjas"
      ],
      [
        156,
        160,
        "1 nagah encantadora escoltada por 4 nagahs retalhadores"
      ],
      [
        161,
        170,
        "4 golens de ferro superiores enviados para eliminar os aventureiros"
      ],
      [
        171,
        185,
        "2 sszzaazitas celebrantes disfarçados de clérigos acusando um ao outro"
      ],
      [
        186,
        200,
        "1 Dragão-Real (essência)"
      ],
      [
        201,
        300,
        "Tarso, Dragão-Rei dos Mortos, pedindo um sorvete amigavelmente"
      ]
    ]
  },
  {
    "id": "urbano",
    "name": "Urbano (Valkaria, Vectora, Nova Malpetrim, Khalifor, Smokestone)",
    "pdfPage": 430,
    "entries": [
      [
        1,
        2,
        "Uma carroça de verduras desgovernada na ladeira"
      ],
      [
        3,
        6,
        "1d3+1 bandidos comuns num beco"
      ],
      [
        7,
        10,
        "1 t’peel carregando os pertences roubados de um bardo"
      ],
      [
        11,
        20,
        "1 devoto de Hyninn simão e 1 tentacute"
      ],
      [
        21,
        30,
        "4 devotos de Hyninn manhosos aplicando golpe"
      ],
      [
        31,
        35,
        "1d4 pakks causando um incêndio em uma loja"
      ],
      [
        36,
        40,
        "1d4 gnolls saqueadores dividindo um saque"
      ],
      [
        41,
        50,
        "1 mashin monge ensinando meditação (+2 em Vontade até o fim da aventura)"
      ],
      [
        51,
        60,
        "2 gárgulas empoleiradas no telhado"
      ],
      [
        61,
        65,
        "1 chefe de gangue e 2d4 bandidos ligeiros"
      ],
      [
        66,
        70,
        "1 gangue goblin causando tumulto"
      ],
      [
        71,
        80,
        "4 jagunços cobrando proteção"
      ],
      [
        81,
        90,
        "2 iniciados de Sszzaas fingindo atacar 1 hynne dormente para atrair os heróis"
      ],
      [
        91,
        98,
        "1 caçador de impuros purista perseguindo um não-humano"
      ],
      [
        99,
        100,
        "1 forjador litúrgico de Arsenal oferecendo 1 arma com encanto a quem o derrotar em duelo"
      ],
      [
        101,
        110,
        "4 kappa brigões e 1 nezumi ninja enfrentando 1 coletor de Arsenal"
      ],
      [
        111,
        115,
        "1 dragão adulto dos segredos infiltrado"
      ],
      [
        116,
        125,
        "1 chapéu-preto em missão de assassinato"
      ],
      [
        126,
        130,
        "1 centurião de elite, 2 decúrias e 1 minauro arcanista levando 1 minauro ladino prisioneiro"
      ],
      [
        131,
        135,
        "1 fantasma ancestral assombrando um casarão"
      ],
      [
        136,
        145,
        "1 alto clérigo de Kally, 2 clérigos de Kally e 1d6 acólitos de Kally atacando a cidade"
      ],
      [
        146,
        150,
        "3 tanaloom disfarçados como pilares de uma igreja"
      ],
      [
        151,
        155,
        "1 dragão venerável (trevas), 1 governador corrupto e 2 gladiadores táuricos"
      ],
      [
        156,
        160,
        "1 cemitério vivo erguendo-se na necrópole municipal"
      ],
      [
        161,
        170,
        "2 soldados superiores puristas infiltrados"
      ],
      [
        171,
        185,
        "2 liches de Aslothia conspirando"
      ],
      [
        186,
        200,
        "Falsa Congregação: 2 sszzaazitas celebrantes que invocam 1 Nastarrath na multidão"
      ],
      [
        201,
        300,
        "Invasão Purista: 1d6 soldados superiores e 1d6 colossos supremos"
      ]
    ]
  },
  {
    "id": "subterraneo",
    "name": "Subterrâneo & Masmorras (Doherimm, Catacumbas, Cavernas)",
    "pdfPage": 429,
    "entries": [
      [
        1,
        2,
        "Fazenda de mycotann livres (permite descanso luxuoso — ou será armadilha?)"
      ],
      [
        3,
        6,
        "1 kill’bone lutando contra 1 perdigueiro troll"
      ],
      [
        7,
        10,
        "1 slark pendurado silenciosamente no teto"
      ],
      [
        11,
        20,
        "1 enxame larval explodindo de uma das paredes"
      ],
      [
        21,
        30,
        "1 turba de zumbis vagando no escuro"
      ],
      [
        31,
        35,
        "1d6+2 fofos bloqueando o corredor"
      ],
      [
        36,
        40,
        "4 orcs combatentes e 1 orc veterano"
      ],
      [
        41,
        50,
        "Uma aventureira perdida pedindo socorro (na verdade 1 nagah dormente)"
      ],
      [
        51,
        60,
        "1 basilisco junto a estátuas de pedra"
      ],
      [
        61,
        65,
        "1 finntroll caçador arrastando 1 mycotann labutador acorrentado"
      ],
      [
        66,
        70,
        "1 trog rei dos túneis e sua guarda"
      ],
      [
        71,
        80,
        "Labirinto de túneis naturais (exige Sobrevivência/Percepção)"
      ],
      [
        81,
        90,
        "1 cavaleiro finntroll em patrulha"
      ],
      [
        91,
        98,
        "2 armeiros de Tenebra devotos"
      ],
      [
        99,
        100,
        "1 troll das cavernas faminto"
      ],
      [
        101,
        110,
        "1 orc mutante superior"
      ],
      [
        111,
        115,
        "1 mortalha espreitando nas sombras"
      ],
      [
        116,
        125,
        "1 golem de pedra guardião ancestral"
      ],
      [
        126,
        130,
        "Cabala Tenebrista: 2 armeiros de Tenebra clérigos e 6 armeiros devotos"
      ],
      [
        131,
        135,
        "1 golem de ferro superior"
      ],
      [
        136,
        145,
        "1 arcanista finntroll, 1 finntroll senhor de estábulo e 1 alto sacerdote finntroll"
      ],
      [
        146,
        150,
        "2 brawar protegendo a entrada de um cofre arcano"
      ],
      [
        151,
        155,
        "2 arcanistas finntroll e 4 trolls das cavernas"
      ],
      [
        156,
        160,
        "1 cemitério vivo (de anões) sob efeito de Profanar"
      ],
      [
        161,
        170,
        "1 rival espelho para cada membro do grupo"
      ],
      [
        171,
        185,
        "1 necrodraco lich nas profundezas"
      ],
      [
        186,
        300,
        "Conventículo Escravagista: 1 Dragão-Real (psíquico) e 2d6 finntrolls arcanistas"
      ]
    ]
  },
  {
    "id": "floresta",
    "name": "Floresta (Tollon, Sambúrdia, Pondsmânia, Deheon)",
    "pdfPage": 427,
    "entries": [
      [
        1,
        6,
        "1 kobold patrulheiro aparentemente perdido"
      ],
      [
        7,
        10,
        "1 terrier elemental curioso"
      ],
      [
        11,
        20,
        "2 gnolls capangas farejando a trilha"
      ],
      [
        21,
        30,
        "1d4 ursos pandas"
      ],
      [
        31,
        35,
        "1 tropa de tentacutes tentando furtar um item brilhante do grupo"
      ],
      [
        36,
        40,
        "Grama carnívora camuflada na clareira"
      ],
      [
        41,
        50,
        "1d4 enxames larvais"
      ],
      [
        51,
        60,
        "2d4 capivaras pacíficas"
      ],
      [
        61,
        65,
        "1d4+1 lagartos perseguidores"
      ],
      [
        66,
        70,
        "1 tigre-de-Hyninn espreitando nas copas"
      ],
      [
        71,
        80,
        "1 carrasco de Lena faminto"
      ],
      [
        81,
        90,
        "1d6+2 aranhas gigantes (metade do terreno coberto de teias)"
      ],
      [
        91,
        98,
        "2 defeituosos fugitivos"
      ],
      [
        99,
        100,
        "1 gnoll xamã de Megalokk, 1 gorlogg alfa e 1 serpe"
      ],
      [
        101,
        110,
        "2 entes conversando lentamente"
      ],
      [
        111,
        115,
        "1 bruxa goblin em sua cabana"
      ],
      [
        116,
        125,
        "1d4+2 tendrículos"
      ],
      [
        126,
        130,
        "Caçada Primal: 1 centauro chefe, 2 centauros xamãs de Megalokk e 4 ursos das cavernas"
      ],
      [
        131,
        135,
        "1 górgona matriarca"
      ],
      [
        136,
        145,
        "1 dragão venerável (veneno)"
      ],
      [
        146,
        155,
        "1 gnoll Vuul’rak ou 1 ezzayn explorando a região"
      ],
      [
        156,
        170,
        "2 razza’kham caçando"
      ],
      [
        171,
        300,
        "Santuário de Allihanna protegido por 4 totens da Divina Serpente e 4 tanaloom"
      ]
    ]
  },
  {
    "id": "planicie",
    "name": "Planície & Campos (Namalkah, Ahlen, Svalas, Salistick)",
    "pdfPage": 429,
    "entries": [
      [
        1,
        6,
        "1d4 bandidos comuns e 1 bandido ligeiro"
      ],
      [
        7,
        10,
        "1 t’peel carregando um medalhão de T$ 25"
      ],
      [
        11,
        20,
        "Tropel de 2d4 cavalos selvagens"
      ],
      [
        21,
        30,
        "1d4 gnolls capangas"
      ],
      [
        31,
        35,
        "1 pantera furtiva caçando"
      ],
      [
        36,
        40,
        "1 gnoll xamã de Allihanna e 1 hiena"
      ],
      [
        41,
        50,
        "1 leão caçando 1 trobo"
      ],
      [
        51,
        60,
        "1 duplo se passando por um conhecido do grupo"
      ],
      [
        61,
        65,
        "3 goblins de sombreiro num impasse mexicano"
      ],
      [
        66,
        70,
        "1 líder pistoleiro e 2 pistoleiros"
      ],
      [
        71,
        80,
        "1 gnoll xamã de Marah oferecendo cura se entregarem as armas"
      ],
      [
        81,
        90,
        "1 gnoll xamã de Megalokk e 4 gnolls saqueadores"
      ],
      [
        91,
        98,
        "1d6+1 elefantes pastando"
      ],
      [
        99,
        100,
        "1 golem de bronze enguiçado de uma batalha antiga"
      ],
      [
        101,
        110,
        "1 cavaleiro de Kally e 1 clérigo de Kally"
      ],
      [
        111,
        115,
        "1 tigre-de-Hyninn primordial"
      ],
      [
        116,
        125,
        "1 matrona gnoll e 1d6+1 gnolls caçadores de cabeças"
      ],
      [
        126,
        130,
        "1 concílio forjador procurando pelo grupo"
      ],
      [
        131,
        135,
        "Duelo entre 1 chapéu-preto e 1 demônio da pólvora"
      ],
      [
        136,
        150,
        "2 golens de pedra ou 1 gnoll Vuul’rak"
      ],
      [
        151,
        300,
        "1 Dragão-Real (eletricidade) ou A Horda Risonha"
      ]
    ]
  },
  {
    "id": "montanha",
    "name": "Montanha & Sanguinárias (Montanhas Sanguinárias, Teldiskan)",
    "pdfPage": 428,
    "entries": [
      [
        1,
        10,
        "1 carcaju feroz (em seu covil há uma arma neko-te)"
      ],
      [
        11,
        20,
        "Pedra solta rolando montanha abaixo (Armadilha Bloco de Pedra ND 1)"
      ],
      [
        21,
        35,
        "4 lobos ou 1 pantera espreitando"
      ],
      [
        36,
        50,
        "1 chefe de gangue e 1d4 capangas ou 1 urso pardo"
      ],
      [
        51,
        60,
        "1 orc chefe e 1d4+1 orcs combatentes"
      ],
      [
        61,
        70,
        "1 ogro ou 1d3+1 grifos"
      ],
      [
        71,
        80,
        "1d4+1 cerianthar preparando emboscada"
      ],
      [
        81,
        90,
        "1 ogro caçador nas escarpas"
      ],
      [
        91,
        98,
        "1d4+1 cães do inferno"
      ],
      [
        99,
        100,
        "1d4 serpes e 1 serpe anciã"
      ],
      [
        101,
        110,
        "2 tengu bandoleiros e 1 daitengu"
      ],
      [
        111,
        115,
        "1d4+2 ogros furiosos e 1 keylor"
      ],
      [
        116,
        125,
        "1 dragão bicéfalo ou 2 oxxdons imensos"
      ],
      [
        126,
        135,
        "1 concílio forjador combatendo 1 dragão feral"
      ],
      [
        136,
        150,
        "1 grande tachygloss ou 1 mantícora primal"
      ],
      [
        151,
        170,
        "1 vagalhão kobold ou 2 razza’kham caçando"
      ],
      [
        171,
        300,
        "1 Dragão-Real (fogo) ou 2 Kaiju disputando território"
      ]
    ]
  },
  {
    "id": "artico",
    "name": "Ártico & Montanhas Uivantes",
    "pdfPage": 425,
    "entries": [
      [
        1,
        10,
        "1d4 zumbis congelados ou 1 carcaju"
      ],
      [
        11,
        20,
        "1d3+1 lobos famintos na neve"
      ],
      [
        21,
        30,
        "1 aquin’ne elemental"
      ],
      [
        31,
        35,
        "1 soterrado vagante emergindo do gelo"
      ],
      [
        36,
        40,
        "1 minotauro da Manada com 1 lobo das cavernas"
      ],
      [
        41,
        50,
        "1 chefe de gangue e 1d3+1 bandidos selvagens"
      ],
      [
        51,
        60,
        "1 ogro das neves"
      ],
      [
        61,
        65,
        "Perigo Complexo: Avalanche (ND 4)"
      ],
      [
        66,
        80,
        "1 minotauro chefe da Manada"
      ],
      [
        81,
        90,
        "2 gigantes esqueletos"
      ],
      [
        91,
        100,
        "1 mamute ou 1 urso das neves"
      ],
      [
        101,
        115,
        "2 golens de Nor enormes ou 1d4+1 mamutes esqueletos"
      ],
      [
        116,
        130,
        "1 dragão bicéfalo (eletricidade e frio) ou 1d4+2 vermes do gelo larvas"
      ],
      [
        131,
        145,
        "1 fantasma ancestral e 2 fantasmas guardando templo de Beluhga (1d4 riquezas médias)"
      ],
      [
        146,
        160,
        "2d4 lyubas (1d3 riquezas menores) ou 1 verme do gelo adulto"
      ],
      [
        161,
        300,
        "1 necrodraco lich ou Ninho de vermes do gelo (2 adultos e 2d4 larvas)"
      ]
    ]
  },
  {
    "id": "pantano",
    "name": "Pântano (Pântano dos Juncos, Pântano dos Vermes)",
    "pdfPage": 428,
    "entries": [
      [
        1,
        10,
        "1d3 glops ou 1d4+1 garras-zumbi"
      ],
      [
        11,
        30,
        "1 trog caçador preparando emboscada submersa"
      ],
      [
        31,
        40,
        "1 elemental do veneno pequeno ou área de dejetos alquímicos"
      ],
      [
        41,
        50,
        "1 garra-zumbi enxame"
      ],
      [
        51,
        60,
        "1d4 gnolls saqueadores e 1 gnoll xamã de Allihanna"
      ],
      [
        61,
        70,
        "1 ninhada de dragões filhotes (ácido)"
      ],
      [
        71,
        80,
        "1 finntroll caçador e 4 perdigueiros troll"
      ],
      [
        81,
        90,
        "1 fantasma de um viajante em busca de seu anel"
      ],
      [
        91,
        98,
        "1d6+2 tatus-montanha"
      ],
      [
        99,
        100,
        "1 cocatriz-real e 1d3+1 cocatrizes em seu ninho"
      ],
      [
        101,
        115,
        "2 elementais do veneno médios ou 1 hidra submersa"
      ],
      [
        116,
        130,
        "1 serpe anciã e 1d4+2 serpes ou 1 necrodraco esqueleto em areia movediça"
      ],
      [
        131,
        145,
        "1 necrodraco zumbi ou 1 alto sacerdote finntroll com 1 elemental do veneno grande"
      ],
      [
        146,
        160,
        "2 serpentaar ou 1 horda de otyughs com 1 elemental corrompido"
      ],
      [
        161,
        300,
        "2 cemitérios vivos ou 1 necrodraco lich"
      ]
    ]
  },
  {
    "id": "deserto",
    "name": "Deserto da Perdição (Halak-Tûr)",
    "pdfPage": 427,
    "entries": [
      [
        1,
        10,
        "Caravana de negociantes (descanso confortável) ou 1 pakk"
      ],
      [
        11,
        30,
        "1d3+1 bandidos comuns sar-allan ou 1 trog e 1 terrier"
      ],
      [
        31,
        40,
        "1 trog caçador ou 1 iniciado da agonia"
      ],
      [
        41,
        50,
        "4 bandidos ligeiros sar-allan"
      ],
      [
        51,
        60,
        "2 chacais zumbis disputando 1 garra-zumbi"
      ],
      [
        61,
        70,
        "1 iniciada de Sszzaas ou Ciclone Arcano"
      ],
      [
        71,
        80,
        "2 feras-vassalo (Fera-Cacto)"
      ],
      [
        81,
        90,
        "2 gatunos (seguidos por tempestade de areia em 3 rodadas)"
      ],
      [
        91,
        98,
        "1 ber-baram elemental do fogo"
      ],
      [
        99,
        100,
        "2 iniciadas de Sszzaas e 1 cultista de Sszzaas disfarçados de peregrinos"
      ],
      [
        101,
        115,
        "2 pamgras e 1 trog anão eremita"
      ],
      [
        116,
        130,
        "1 sacerdote da agonia e 1d6+2 fanáticos lefou"
      ],
      [
        131,
        145,
        "1 serpentaar ou 1 fera-mãe com 2d6 feras-líder"
      ],
      [
        146,
        160,
        "1 reishid líder de culto, 2 senhores das múmias ou 1 golem de matéria vermelha"
      ],
      [
        161,
        300,
        "1 górgona matriarca com 4 elementais do veneno grandes ou 1 Dragão-Real"
      ]
    ]
  },
  {
    "id": "aquatico",
    "name": "Aquático & Alto-Mar (Mar Negro, Mar do Dragão-Rei, Khubar)",
    "pdfPage": 425,
    "entries": [
      [
        1,
        10,
        "1d3 piratas ou 1 hynne dormente se afogando"
      ],
      [
        11,
        30,
        "1 baú de tesouro flutuante/submerso (ND 3) e 1d4+2 piratas"
      ],
      [
        31,
        40,
        "1 elfo-do-mar pescador ou 1 canceronte"
      ],
      [
        41,
        50,
        "1 dragão filhote dos rios"
      ],
      [
        51,
        65,
        "2 lacedons ou 1d3 platans"
      ],
      [
        66,
        70,
        "Perigo Complexo: Tempestade em Alto-Mar (ND 6)"
      ],
      [
        71,
        80,
        "1 enxame de águas-vivas"
      ],
      [
        81,
        90,
        "1 capitão pirata"
      ],
      [
        91,
        100,
        "1 homem-piranha capitão e 1d6+1 homens-piranha (ou 1 raposa bucaneira vs 1d4 afogados)"
      ],
      [
        101,
        115,
        "2 águas-vivas gigantes ou 1d4+1 corganns"
      ],
      [
        116,
        130,
        "1 nereida ou 1 peixe-recife atacado por 2 pliorex abissais"
      ],
      [
        131,
        150,
        "1 namasqall, 1 dragão venerável dos recifes ou 1 canceronte de guerra"
      ],
      [
        151,
        160,
        "1 Lobo do Mar, 2 capitães piratas e 2d8 piratas"
      ],
      [
        161,
        300,
        "1 Enguia Rainha, 1 Kraken ou 1 Kaiju marinho"
      ]
    ]
  },
  {
    "id": "tormenta",
    "name": "Área de Tormenta (Tempestade Rubra)",
    "pdfPage": 426,
    "entries": [
      [
        1,
        10,
        "Chuva ácida por 1d4+1 rodadas ou 1 armadilha viva"
      ],
      [
        11,
        30,
        "Insanidade da Tormenta (1d6 PM, Von CD 14) ou Fenômeno Rubro"
      ],
      [
        31,
        50,
        "1 uktril ou 1 árvore rubra (1d3 sementes rubras)"
      ],
      [
        51,
        65,
        "1d3 infectos ou 1d4 iniciados da agonia"
      ],
      [
        66,
        80,
        "1 geraktril e 2 maníacos lefou escoltando prisioneiros"
      ],
      [
        81,
        90,
        "1 alma acorrentada"
      ],
      [
        91,
        98,
        "1 enxame infernal"
      ],
      [
        99,
        100,
        "1 Senhor do Gigante Rubro (forma inicial)"
      ],
      [
        101,
        115,
        "1d4 veridak (lefeu)"
      ],
      [
        116,
        130,
        "1 dragão feral corrompido ou 1 morgadrel (lefeu)"
      ],
      [
        131,
        145,
        "1 arquibruxo da Tormenta e 2 turbas de infectos (ou 1 reishid líder de culto e 2d4 zyrrinaz)"
      ],
      [
        146,
        160,
        "1 thuwarokk, 2 esmagadores coletivos ou 1 ezzayn"
      ],
      [
        161,
        300,
        "Templo de Aharadak com Avatar de Aharadak ou Gatzvalith"
      ]
    ]
  },
  {
    "id": "aslothia",
    "name": "Aslothia (Reino dos Mortos)",
    "pdfPage": 430,
    "entries": [
      [
        1,
        10,
        "2 garras-zumbi ou 1 carniçal"
      ],
      [
        11,
        30,
        "1d4 zumbis ou 1 lacedon"
      ],
      [
        31,
        40,
        "1 garra-zumbi enxame"
      ],
      [
        41,
        60,
        "1 ogro esqueleto ou 1d4 chacais-zumbi"
      ],
      [
        61,
        70,
        "4 carniçais e 1 lívido"
      ],
      [
        71,
        90,
        "2 mercenários de Aslothia e 1 líder mercenário de Aslothia"
      ],
      [
        91,
        100,
        "1 wisphago ou 1 morgue’raz"
      ],
      [
        101,
        115,
        "2 fantasmas em conflito ou 1 mortalha"
      ],
      [
        116,
        130,
        "1 capitão afogado e 2d4+1 afogados ou 2 alzeras"
      ],
      [
        131,
        145,
        "1 senhor das múmias e 2 múmias"
      ],
      [
        146,
        160,
        "1 lich e 1 necrodraco esqueleto ou 1 cemitério vivo"
      ],
      [
        161,
        300,
        "1 lich de Aslothia e 4 necrodracos zumbis ou 1 necrodraco lich"
      ]
    ]
  },
  {
    "id": "puristas",
    "name": "Supremacia Purista & Fronteira de Guerra",
    "pdfPage": 433,
    "entries": [
      [
        1,
        10,
        "Clérigo de Tanna-Toh ferido (parceiro ajudante se salvo) ou 4 goblins fugitivos"
      ],
      [
        11,
        30,
        "1 chefe bandido ou 1 purificado fugitivo"
      ],
      [
        31,
        60,
        "2 corcéis de comando puristas em patrulha"
      ],
      [
        61,
        70,
        "1 dançarino de guerra e 2 bandidos selvagens"
      ],
      [
        71,
        90,
        "2 soldados blindados e 1 capelão de guerra"
      ],
      [
        91,
        100,
        "1 dançarino de guerra veterano e 2 capelães de guerra"
      ],
      [
        101,
        115,
        "1d6+1 guerreiros perpétuos ou 2 caçadores de impuros"
      ],
      [
        116,
        130,
        "1 companhia blindada de elite e 1 arcano de guerra veterano (com 2 golens de bronze)"
      ],
      [
        131,
        145,
        "1 kishin e 1d6+2 bispos de guerra"
      ],
      [
        146,
        160,
        "4 arcanos de guerra veteranos em 2 carruagens de comando"
      ],
      [
        161,
        300,
        "2 golens de ferro superiores e 1 soldado superior purista"
      ]
    ]
  },
  {
    "id": "tauron",
    "name": "Império de Tauron (Tapista)",
    "pdfPage": 432,
    "entries": [
      [
        1,
        10,
        "Família de refugiados de Tiberus ou 2 piratas"
      ],
      [
        11,
        30,
        "1 legionário ou 2 bandidos selvagens"
      ],
      [
        31,
        50,
        "1 infecto ou 2 capangas minotauros"
      ],
      [
        51,
        65,
        "1 iniciado da agonia ou 1 capelão de guerra de Arsenal"
      ],
      [
        66,
        80,
        "1 minauro arcanista estudando 2 fúrias de Tauron"
      ],
      [
        81,
        98,
        "2 decúrias tapistanas em marcha"
      ],
      [
        99,
        100,
        "4 arqueiros escravos e 1 governador corrupto"
      ],
      [
        101,
        115,
        "Arena com gladiadores táuricos ou 1 armadilha viva"
      ],
      [
        116,
        130,
        "1 chapéu-preto caçando foragido ou 1 morgadrel (lefeu)"
      ],
      [
        131,
        150,
        "1 arquibruxo da Tormenta ou 1 Senhor do Gigante Rubro"
      ],
      [
        151,
        300,
        "2 elementais corrompidos enfrentando 2d4+2 centuriões de elite"
      ]
    ]
  },
  {
    "id": "galrasia",
    "name": "Galrasia (O Mundo Perdido)",
    "pdfPage": 431,
    "entries": [
      [
        1,
        10,
        "1 pirata fugindo de 1 enxame de gali-gali ou 1 voracis drogadora"
      ],
      [
        11,
        35,
        "1d4+1 piratas enterrando 1 riqueza menor ou 1 galhada fêmea"
      ],
      [
        36,
        60,
        "2 pteros ceifadores sobrevoando a copa"
      ],
      [
        61,
        70,
        "1 espada-da-floresta montado em 1 galhada macho ou 1d3+1 ceratops guerreiros"
      ],
      [
        71,
        80,
        "2 burafontes pastando"
      ],
      [
        81,
        90,
        "1 ptero do Céu Infinito e 2 pteros ceifadores"
      ],
      [
        91,
        100,
        "1 gorlogg alfa e 1d4+2 gorloggs ou 1d3+1 uraghians jovens"
      ],
      [
        101,
        115,
        "1 xamã de Sarana e 1d3+1 velocis caçadores (ou 1 ceratops chefe da tribo)"
      ],
      [
        116,
        130,
        "1 árvore-matilha ou 1 rei-tirano batalhando contra 1 tuntram"
      ],
      [
        131,
        150,
        "1 tanaloom, 1 dragão venerável da equidade ou 1d3+1 grande battham"
      ],
      [
        151,
        300,
        "1 voracis rainha e 2d6 voracis caçadoras ou 1 Kaiju adormecido"
      ]
    ]
  },
  {
    "id": "lamnor",
    "name": "Ruínas de Tyrondir & Lamnor (Aliança Negra)",
    "pdfPage": 433,
    "entries": [
      [
        1,
        10,
        "1d4+1 goblins salteadores ou 1 bandido ligeiro e 2 bandidos comuns"
      ],
      [
        11,
        30,
        "1 zumbi peçonha ou 1 turba de zumbis"
      ],
      [
        31,
        50,
        "1 ogro esqueleto ou 1 imediato e 1d4+1 piratas"
      ],
      [
        51,
        70,
        "1 tigre-de-Hyninn espreitando nas ruínas"
      ],
      [
        71,
        90,
        "1 bugbear guarda-costas e 1d3+1 bugbears sentinelas"
      ],
      [
        91,
        100,
        "Ruínas com 1d4+1 riquezas menores prestes a desabar ou 1 goblin de ferro mark II com 4 goblins-bomba"
      ],
      [
        101,
        115,
        "1 devorador de medos e 2 bugbears guarda-costas"
      ],
      [
        116,
        130,
        "1 hobgoblin comandante tático e 2 hobgoblins atiradores"
      ],
      [
        131,
        145,
        "1 horda goblin ou Ruínas com 1 fantasma ancestral e 4 fantasmas"
      ],
      [
        146,
        160,
        "1 necrodraco zumbi num lago de lodo negro ou 1d4+2 tigres-de-Hyninn primordiais"
      ],
      [
        161,
        300,
        "1 Sangue de Ayrrak, 4 hobgoblins gladiadores e 2 bruxas goblins"
      ]
    ]
  }
];

export function drawNimbAdventure(forcedEnredoId?: string): GeneratedAdventureDraw {
  const enredos = BARALHO_AVENTURAS.filter((c) => c.category === 'Enredo');
  const enredo =
    (forcedEnredoId && enredos.find((e) => e.id === forcedEnredoId)) ||
    enredos[Math.floor(Math.random() * enredos.length)];

  const usedIds = new Set<string>([enredo.id]);
  const slots: DrawnAdventureSlot[] = [];

  for (const slot of enredo.nimbSlots || []) {
    const pool = BARALHO_AVENTURAS.filter(
      (c) => slot.allowedTypes.includes(c.category) && !usedIds.has(c.id)
    );
    const chosen =
      pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : BARALHO_AVENTURAS.filter((c) => slot.allowedTypes.includes(c.category))[0];
    if (chosen) {
      usedIds.add(chosen.id);
      slots.push({
        role: slot.role,
        card: chosen,
      });
    }
  }

  return {
    id: `adv-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    enredo,
    slots,
  };
}

export function rollRandomEncounter(
  terrainId: string,
  patamar: 'iniciante' | 'veterano' | 'campeao' | 'lenda'
): {
  terrainName: string;
  pdfPage: number;
  rawD100: number;
  modifier: number;
  finalRoll: number;
  resultText: string;
  isRhandommThreat: boolean;
} {
  const table = RANDOM_ENCOUNTER_TABLES.find((t) => t.id === terrainId) || RANDOM_ENCOUNTER_TABLES[0];
  const rawD100 = Math.floor(Math.random() * 100) + 1;
  const modifier =
    patamar === 'veterano' ? 30 : patamar === 'campeao' ? 70 : patamar === 'lenda' ? 110 : 0;
  const finalRoll = rawD100 + modifier;
  const entry =
    table.entries.find((e) => finalRoll >= e[0] && finalRoll <= e[1]) ||
    table.entries[table.entries.length - 1];

  const isRhandommThreat = rawD100 === 100 && Math.floor(Math.random() * 4) + 1 === 1;

  return {
    terrainName: table.name,
    pdfPage: table.pdfPage,
    rawD100,
    modifier,
    finalRoll,
    resultText: isRhandommThreat
      ? `⚠️ O RHANDOMM (ND 20)! (100 natural no d% + 1 no 1d4! Original: ${entry[2]})`
      : entry[2],
    isRhandommThreat,
  };
}
