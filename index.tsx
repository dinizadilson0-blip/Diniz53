import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, Search, BookOpen, Calculator, Leaf, 
  ChevronRight, ArrowLeft, Bug, FlaskConical, 
  AlertTriangle, ArrowRightLeft, Droplet, Sprout, 
  X, Loader2, Thermometer, CloudRain, Timer, Scale, Tractor
} from "lucide-react";

// --- Configuration & Mock Data ---

const PLANAGRO_GREEN = "#006837";
const PLANAGRO_LIGHT = "#8CC63F";

// Extended Data Structure
const MANUAL_DATA = [
  // --- SOLOS & GERAL ---
  {
    id: "soil-1",
    type: "topico",
    category: "Solos",
    title: "Amostragem de Solo",
    content: "A amostragem de solo é a etapa mais crítica do programa de adubação e calagem. Um erro na amostragem não pode ser corrigido no laboratório. Para culturas anuais, recomenda-se amostrar a camada de 0-20 cm. Divida a propriedade em glebas homogêneas quanto à cor, textura, histórico de manejo e topografia. Retire 15 a 20 subamostras por gleba para formar uma amostra composta.",
    tags: ["solo", "amostragem", "análise"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Amostragem+de+Solo"
  },
  {
    id: "nutri-1",
    type: "topico",
    category: "Nutrição",
    title: "Calagem (Correção de Acidez)",
    content: "A calagem tem como objetivos elevar o pH, fornecer Ca e Mg e neutralizar o Al tóxico. O método mais utilizado é o da Saturação por Bases (V%).\n\nFórmula:\nNC (t/ha) = (V2 - V1) x CTC / 100\n\nOnde:\nNC = Necessidade de Calagem\nV2 = Saturação por bases desejada (ex: 60% para soja)\nV1 = Saturação por bases atual (análise de solo)\nCTC = Capacidade de Troca de Cátions",
    tags: ["calagem", "ph", "acidez", "cálculo"],
    hasCalculator: "calagem",
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Aplicacao+de+Calcario"
  },
  // --- PRAGAS ---
  {
    id: "pest-1",
    type: "praga",
    category: "Pragas",
    title: "Percevejo Marrom (Euschistus heros)",
    content: "O percevejo-marrom é uma das principais pragas da soja no Neotrópico.\n\nIdentificação:\nAdultos de cor marrom-escura, com dois espinhos laterais no pronoto.\n\nDanos:\nSucção de seiva nas vagens e grãos, causando retenção foliar ('soja louca') e grãos chochos ou enrugados. Reduz drasticamente a qualidade da semente e o poder germinativo.\n\nMonitoramento:\nPano de batida. Realizar amostragens semanais a partir da fase reprodutiva.\n\nNível de controle:\n2 percevejos/metro linear para lavouras de grãos.\n1 percevejo/metro para sementes.",
    tags: ["soja", "praga", "percevejo", "inseto"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Percevejo+Marrom"
  },
  {
    id: "pest-2",
    type: "praga",
    category: "Pragas",
    title: "Lagarta-do-cartucho (Spodoptera frugiperda)",
    content: "Principal praga do milho, mas ataca também soja, algodão e outras.\n\nIdentificação:\nLagarta com 'Y' invertido na cabeça e quatro pontos pretos no final do abdome dispostos em quadrado.\n\nDanos:\nNo milho, consome o cartucho, destruindo o ponto de crescimento. Pode atacar espigas.\n\nControle:\nUso de milho Bt, tratamento de sementes e inseticidas em jato dirigido ao cartucho.",
    tags: ["milho", "praga", "lagarta"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Lagarta+do+Cartucho"
  },
  
  // --- DOENÇAS ---
  {
    id: "dis-01",
    type: "doenca",
    category: "Doenças",
    title: "1. Ferrugem Asiática (Phakopsora pachyrhizi)",
    content: "A doença mais severa da soja.\n\nSintomas:\nPontuações escuras (urédias) na face inferior da folha, evoluindo para necrose e desfolha precoce.\n\nControle:\nMonitoramento, vazio sanitário e fungicidas (sítio-específicos + multissítios).",
    tags: ["soja", "fungo", "ferrugem"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Ferrugem+Asiatica"
  },
  {
    id: "dis-02",
    type: "doenca",
    category: "Doenças",
    title: "2. Mofo Branco (Sclerotinia sclerotiorum)",
    content: "Doença causada por fungo de solo.\n\nSintomas:\nMicélio branco e cotonoso nas hastes e vagens; formação de escleródios pretos (estruturas de resistência) dentro da haste.\n\nControle:\nRotação de culturas com gramíneas, cobertura de solo (palhada), Trichoderma e fungicidas na floração.",
    tags: ["soja", "mofo", "esclerodio"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Mofo+Branco"
  },
  {
    id: "dis-03",
    type: "doenca",
    category: "Doenças",
    title: "3. Antracnose (Colletotrichum truncatum)",
    content: "Afeta soja desde a plântula até a colheita.\n\nSintomas:\nManchas negras nas nervuras das folhas, pecíolos e hastes. Nas vagens, causa lesões escuras e retorcimento (forma de canoa), abortamento e grãos ardidos.\n\nControle:\nSementes sadias, tratamento de sementes e fungicidas.",
    tags: ["soja", "antracnose", "vagem"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Antracnose"
  },
  
  // --- DEFICIÊNCIAS NUTRICIONAIS (COMPLETA) ---
  // Macronutrientes
  {
    id: "def-n",
    type: "deficiencia",
    category: "Deficiências",
    title: "Nitrogênio (N)",
    content: "Nutriente móvel na planta.\n\nSintomas:\nClorose (amarelecimento) geral e uniforme nas folhas *velhas* (baixeiras). Planta com porte reduzido e afilhamento/ramificação limitada. No milho, a clorose segue a nervura central em forma de 'V' invertido.\n\nCausa Comum:\nBaixa matéria orgânica, falha na inoculação (soja), solos arenosos lavados.",
    tags: ["macro", "nitrogênio", "folhas velhas", "amarelo"],
    imageUrl: "https://placehold.co/600x400/fffbeb/006837?text=Deficiencia+Nitrogenio"
  },
  {
    id: "def-p",
    type: "deficiencia",
    category: "Deficiências",
    title: "Fósforo (P)",
    content: "Nutriente móvel na planta.\n\nSintomas:\nFolhas *velhas* com coloração arroxeada ou verde-escuro azulado. Crescimento radicular e aéreo muito lento (plantas anãs). Hastes finas.\n\nCausa Comum:\nFixação de P em solos argilosos ácidos, adubação de base insuficiente.",
    tags: ["macro", "fósforo", "roxo", "raiz"],
    imageUrl: "https://placehold.co/600x400/e9d5ff/006837?text=Deficiencia+Fosforo"
  },
  {
    id: "def-k",
    type: "deficiencia",
    category: "Deficiências",
    title: "Potássio (K)",
    content: "Nutriente móvel na planta.\n\nSintomas:\nClorose seguida de necrose (queima) nas margens/bordas das folhas *velhas*. Grãos pequenos, enrugados e plantas com caules fracos (acamamento).\n\nCausa Comum:\nBaixo nível no solo, solos arenosos (lixiviação).",
    tags: ["macro", "potássio", "borda queimada"],
    imageUrl: "https://placehold.co/600x400/fff7ed/006837?text=Deficiencia+Potassio"
  },
  {
    id: "def-ca",
    type: "deficiencia",
    category: "Deficiências",
    title: "Cálcio (Ca)",
    content: "Nutriente *imóvel* na planta.\n\nSintomas:\nAparecem nas folhas *novas* e meristemas (pontos de crescimento). Morte da gema apical, folhas novas deformadas ('pescoço' torto), raízes curtas e grossas de cor escura. Podridão apical em frutos.\n\nCausa Comum:\nSolos ácidos, falta de calagem, estresse hídrico (dificulta transporte).",
    tags: ["macro", "cálcio", "folhas novas", "raiz"],
    imageUrl: "https://placehold.co/600x400/f3f4f6/006837?text=Deficiencia+Calcio"
  },
  {
    id: "def-mg",
    type: "deficiencia",
    category: "Deficiências",
    title: "Magnésio (Mg)",
    content: "Nutriente móvel na planta.\n\nSintomas:\nClorose internerval nas folhas *velhas*. As nervuras permanecem verdes, enquanto o espaço entre elas fica amarelo ou branco (aspecto de 'esqueleto' ou 'espinnha de peixe').\n\nCausa Comum:\nDesequilíbrio com Potássio (Excesso de K inibe Mg), solos ácidos.",
    tags: ["macro", "magnésio", "internerval"],
    imageUrl: "https://placehold.co/600x400/fffbeb/006837?text=Deficiencia+Magnesio"
  },
  {
    id: "def-s",
    type: "deficiencia",
    category: "Deficiências",
    title: "Enxofre (S)",
    content: "Nutriente pouco móvel.\n\nSintomas:\nClorose (amarelecimento) uniforme nas folhas *novas* (diferente do Nitrogênio que é nas velhas). Plantas raquíticas.\n\nCausa Comum:\nSolos com baixo teor de matéria orgânica, uso contínuo de adubos concentrados sem S.",
    tags: ["macro", "enxofre", "folhas novas"],
    imageUrl: "https://placehold.co/600x400/fef08a/006837?text=Deficiencia+Enxofre"
  },

  // Micronutrientes
  {
    id: "def-b",
    type: "deficiencia",
    category: "Deficiências",
    title: "Boro (B)",
    content: "Imóvel na planta.\n\nSintomas:\nMorte da gema apical, abortamento de flores e vagens, folhas novas deformadas, espessas e quebradiças. Falhas na polinização.\n\nCausa Comum:\nSolos arenosos, seca prolongada.",
    tags: ["micro", "boro", "florada", "abortamento"],
    imageUrl: "https://placehold.co/600x400/fecaca/006837?text=Deficiencia+Boro"
  },
  {
    id: "def-zn",
    type: "deficiencia",
    category: "Deficiências",
    title: "Zinco (Zn)",
    content: "Pouco móvel.\n\nSintomas:\nEncurtamento dos entrenós (plantas anãs ou 'em roseta'). No milho, forma faixas largas esbranquiçadas ou amareladas paralelas à nervura central nas folhas novas.\n\nCausa Comum:\nSolos com pH alto (calagem excessiva), altos níveis de P.",
    tags: ["micro", "zinco", "milho", "entrenó"],
    imageUrl: "https://placehold.co/600x400/fff7ed/006837?text=Deficiencia+Zinco"
  },
  {
    id: "def-mn",
    type: "deficiencia",
    category: "Deficiências",
    title: "Manganês (Mn)",
    content: "Imóvel.\n\nSintomas:\nClorose internerval nas folhas *novas* (nervuras verdes, fundo amarelo), semelhante ao Ferro, mas com nervuras menos destacadas. Comum em soja RR (glifosato pode quelar Mn temporariamente).\n\nCausa Comum:\nSolos com pH elevado, solos arenosos.",
    tags: ["micro", "manganês", "folhas novas"],
    imageUrl: "https://placehold.co/600x400/fffbeb/006837?text=Deficiencia+Manganes"
  },
  {
    id: "def-fe",
    type: "deficiencia",
    category: "Deficiências",
    title: "Ferro (Fe)",
    content: "Imóvel.\n\nSintomas:\nClorose internerval intensa nas folhas *novas*. As nervuras ficam finas e nitidamente verdes ('reticulado fino'), podendo a folha ficar quase branca em casos severos.\n\nCausa Comum:\nSolos calcários, pH muito alto.",
    tags: ["micro", "ferro", "clorose férrica"],
    imageUrl: "https://placehold.co/600x400/fefce8/006837?text=Deficiencia+Ferro"
  },
  {
    id: "def-cu",
    type: "deficiencia",
    category: "Deficiências",
    title: "Cobre (Cu)",
    content: "Imóvel.\n\nSintomas:\nFolhas novas murchas, enroladas em espiral ou torcidas. Coloração verde-escura azulada ou acinzentada.\n\nCausa Comum:\nSolos orgânicos, excesso de calcário.",
    tags: ["micro", "cobre", "folha torcida"],
    imageUrl: "https://placehold.co/600x400/ecfdf5/006837?text=Deficiencia+Cobre"
  },

  // --- INJÚRIAS ---
  {
    id: "inj-1",
    type: "injuria",
    category: "Injúrias",
    title: "Fitotoxidez (Herbicida)",
    content: "Dano causado por aplicação incorreta ou deriva de defensivos.\n\nSintomas:\n- Folhas com 'Copo' (Dicamba/2,4-D em soja).\n- Clorose internerval ou manchas necróticas (Contactos).\n- Morte do ponto de crescimento ('Coração morto').\n- Diferença: Ocorre em reboleiras ou faixas de aplicação, não generalizado como doença.",
    tags: ["dano", "quimico", "deriva"],
    imageUrl: "https://placehold.co/600x400/fee2e2/006837?text=Fitotoxidez+Herbicida"
  },
  {
    id: "inj-2",
    type: "injuria",
    category: "Injúrias",
    title: "Escaldadura (Sol)",
    content: "Dano abiótico por alta radiação solar e temperatura.\n\nSintomas:\nManchas prateadas, bronzeadas ou avermelhadas nas folhas, geralmente no meio do dossel ou folhas que viraram (face inferior exposta). Comum após períodos nublados seguidos de sol forte.",
    tags: ["sol", "queima", "abiótico"],
    imageUrl: "https://placehold.co/600x400/fff7ed/006837?text=Escaldadura+Solar"
  },
  {
    id: "inj-3",
    type: "injuria",
    category: "Injúrias",
    title: "Granizo",
    content: "Dano mecânico causado por impacto de gelo.\n\nSintomas:\n- Folhas rasgadas ou desfiadas.\n- Hastes quebradas ou com lesões (hematomas) que servem de porta de entrada para fungos.\n- Desfolha súbita.\n\nManejo:\nAvaliar população restante e aplicar fungicidas protetores para cicatrizar ferimentos.",
    tags: ["clima", "gelo", "dano mecanico"],
    imageUrl: "https://placehold.co/600x400/f1f5f9/006837?text=Dano+por+Granizo"
  },
  {
    id: "inj-4",
    type: "injuria",
    category: "Injúrias",
    title: "Geada",
    content: "Congelamento dos tecidos vegetais.\n\nSintomas:\n- Aspecto encharcado (água sai das células) logo após o evento.\n- Tecido torna-se marrom ou preto (necrose) rapidamente.\n- Morte de folhas superiores ou da planta inteira dependendo da intensidade.",
    tags: ["clima", "frio", "congelamento"],
    imageUrl: "https://placehold.co/600x400/eff6ff/006837?text=Dano+por+Geada"
  },
  {
    id: "inj-5",
    type: "injuria",
    category: "Injúrias",
    title: "Estresse Hídrico (Seca)",
    content: "Falta de água no solo.\n\nSintomas:\n- Murcha temporária nas horas quentes, evoluindo para permanente.\n- Enrolamento de folhas (folha 'cebola' no milho, folíolos virados na soja).\n- Abortamento de flores e vagens.\n- Senescência prematura das folhas baixeiras.",
    tags: ["seca", "agua", "murcha"],
    imageUrl: "https://placehold.co/600x400/fffbeb/006837?text=Estresse+Hidrico"
  },

  // --- PRODUTOS (FUNGICIDAS E QUÍMICOS) ---
  {
    id: "prod-def-1",
    type: "produto",
    category: "Produtos",
    title: "Glifosato",
    content: "Herbicida sistêmico não seletivo (exceto para culturas RR).\n\nClasse: Glicina substituída (Inibidor da EPSPs).\nUso: Dessecação e pós-emergência RR.\nEspectro: Gramíneas e folhas largas.",
    tags: ["herbicida", "glicina"],
    imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Glifosato"
  },
  {
    id: "prod-def-2",
    type: "produto",
    category: "Produtos",
    title: "Imidacloprido",
    content: "Inseticida sistêmico do grupo dos Neonicotinoides.\n\nMecanismo: Agonista dos receptores de acetilcolina.\nAlvo: Insetos sugadores (percevejos, pulgões).",
    tags: ["inseticida", "neonicotinoide"],
    imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Imidacloprido"
  },
  // Fungicidas extraídos do arquivo CSV
  { id: "fung-01", type: "produto", category: "Produtos", title: "Metalaxil-M", content: "Grupo Químico: Acilalaninato (A1)\nMecanismo de Ação: Inibe síntese de ácidos nucleicos.", tags: ["fungicida", "acilalaninato"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Metalaxil-M" },
  { id: "fung-02", type: "produto", category: "Produtos", title: "Carbendazim", content: "Grupo Químico: Benzimidazol (B1)\nMecanismo de Ação: Inibe mitose e divisão celular.", tags: ["fungicida", "benzimidazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Carbendazim" },
  { id: "fung-03", type: "produto", category: "Produtos", title: "Tiofanato Metílico", content: "Grupo Químico: Benzimidazol (B1)\nMecanismo de Ação: Inibe mitose e divisão celular.", tags: ["fungicida", "benzimidazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Tiofanato" },
  { id: "fung-04", type: "produto", category: "Produtos", title: "Tiabendazol", content: "Grupo Químico: Benzimidazol (B1)\nMecanismo de Ação: Inibe mitose e divisão celular.", tags: ["fungicida", "benzimidazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Tiabendazol" },
  { id: "fung-05", type: "produto", category: "Produtos", title: "Carboxina", content: "Grupo Químico: Carboxanilida (C2)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "carboxanilida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Carboxina" },
  { id: "fung-06", type: "produto", category: "Produtos", title: "Fluxapiroxade", content: "Grupo Químico: Carboxamida (C2)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "carboxamida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Fluxapiroxade" },
  { id: "fung-07", type: "produto", category: "Produtos", title: "Benzovindiflupir", content: "Grupo Químico: Carboxamida (C2)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "carboxamida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Benzovindiflupir" },
  { id: "fung-08", type: "produto", category: "Produtos", title: "Bixafen", content: "Grupo Químico: Carboxamida (C2)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "carboxamida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Bixafen" },
  { id: "fung-09", type: "produto", category: "Produtos", title: "Boscalida", content: "Grupo Químico: Carboxamida (C2)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "carboxamida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Boscalida" },
  { id: "fung-10", type: "produto", category: "Produtos", title: "Piraclostrobina", content: "Grupo Químico: Estrobilurina (C3)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "estrobilurina"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Piraclostrobina" },
  { id: "fung-11", type: "produto", category: "Produtos", title: "Azoxistrobina", content: "Grupo Químico: Estrobilurina (C3)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "estrobilurina"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Azoxistrobina" },
  { id: "fung-12", type: "produto", category: "Produtos", title: "Trifloxistrobina", content: "Grupo Químico: Estrobilurina (C3)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "estrobilurina"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Trifloxistrobina" },
  { id: "fung-13", type: "produto", category: "Produtos", title: "Picoxistrobina", content: "Grupo Químico: Estrobilurina (C3)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "estrobilurina"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Picoxistrobina" },
  { id: "fung-14", type: "produto", category: "Produtos", title: "Cresoxim metílico", content: "Grupo Químico: Estrobilurina (C3)\nMecanismo de Ação: Inibe respiração mitocondrial.", tags: ["fungicida", "estrobilurina"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Cresoxim" },
  { id: "fung-15", type: "produto", category: "Produtos", title: "Fluazinam", content: "Grupo Químico: Fenilpiridilanina (C5)\nMecanismo de Ação: Desacopla fosforilação oxidativa.", tags: ["fungicida", "fenilpiridilanina"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Fluazinam" },
  { id: "fung-16", type: "produto", category: "Produtos", title: "Procimidona", content: "Grupo Químico: Dicarboxamida (E3)\nMecanismo de Ação: Transdução de sinal.", tags: ["fungicida", "dicarboxamida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Procimidona" },
  { id: "fung-17", type: "produto", category: "Produtos", title: "Iprodiona", content: "Grupo Químico: Dicarboxamida (E3)\nMecanismo de Ação: Transdução de sinal.", tags: ["fungicida", "dicarboxamida"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Iprodiona" },
  { id: "fung-18", type: "produto", category: "Produtos", title: "Fenpropimorfe", content: "Grupo Químico: Morfolinas (G2)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "morfolinas"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Fenpropimorfe" },
  { id: "fung-19", type: "produto", category: "Produtos", title: "Tebuconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Tebuconazol" },
  { id: "fung-20", type: "produto", category: "Produtos", title: "Epoxiconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Epoxiconazol" },
  { id: "fung-21", type: "produto", category: "Produtos", title: "Difenoconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Difenoconazol" },
  { id: "fung-22", type: "produto", category: "Produtos", title: "Propiconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Propiconazol" },
  { id: "fung-23", type: "produto", category: "Produtos", title: "Ciproconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Ciproconazol" },
  { id: "fung-24", type: "produto", category: "Produtos", title: "Protioconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Protioconazol" },
  { id: "fung-25", type: "produto", category: "Produtos", title: "Tetraconazol", content: "Grupo Químico: Triazol (G1)\nMecanismo de Ação: Bloqueia biossíntese de ergosterol.", tags: ["fungicida", "triazol"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Tetraconazol" },
  { id: "fung-26", type: "produto", category: "Produtos", title: "Oxicloreto de cobre", content: "Grupo Químico: Cúpricos (M1)\nMecanismo de Ação: Inativa enzimas essenciais (Multissítio).", tags: ["fungicida", "cuprico", "multissitio"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Oxicloreto" },
  { id: "fung-27", type: "produto", category: "Produtos", title: "Hidróxido de cobre", content: "Grupo Químico: Cúpricos (M1)\nMecanismo de Ação: Inativa enzimas essenciais (Multissítio).", tags: ["fungicida", "cuprico", "multissitio"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Hidroxido" },
  { id: "fung-28", type: "produto", category: "Produtos", title: "Óxido cuproso", content: "Grupo Químico: Cúpricos (M1)\nMecanismo de Ação: Inativa enzimas essenciais (Multissítio).", tags: ["fungicida", "cuprico", "multissitio"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Oxido" },
  { id: "fung-29", type: "produto", category: "Produtos", title: "Mancozeb", content: "Grupo Químico: Ditiocarbamato (M3)\nMecanismo de Ação: Inativa enzimas essenciais (Multissítio).", tags: ["fungicida", "ditiocarbamato", "multissitio"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Mancozeb" },
  { id: "fung-30", type: "produto", category: "Produtos", title: "Clorotalonil", content: "Grupo Químico: Isoftalonitrila (M5)\nMecanismo de Ação: Inativa enzimas essenciais (Multissítio).", tags: ["fungicida", "isoftalonitrila", "multissitio"], imageUrl: "https://placehold.co/600x400/f0fdf4/006837?text=Clorotalonil" },

  // --- OUTROS ---
  {
    id: "plan-1",
    type: "topico",
    category: "Planejamento",
    title: "Estimativa de Produtividade",
    content: "A estimativa de produtividade ajuda no planejamento da colheita e armazenagem. Pode ser feita contando o número de vagens por planta, grãos por vagem e população de plantas.",
    hasCalculator: "produtividade",
    tags: ["colheita", "soja", "milho", "cálculo"],
    imageUrl: "https://placehold.co/600x400/e2e8f0/006837?text=Estimativa+Produtividade"
  }
];

// --- Components ---

function Header({ title, goBack }: { title: string; goBack?: () => void }) {
  const logoUrl = "https://planagro.com.py/wp-content/uploads/2020/09/Logo-Planagro-1.png";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 shadow-sm bg-white border-b border-gray-100">
      {goBack ? (
        <>
          <button onClick={goBack} className="mr-3 p-1 hover:bg-gray-100 rounded-full text-[#006837]">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-wide flex-1 truncate text-[#006837]">{title}</h1>
        </>
      ) : (
        <div className="flex items-center w-full">
            <div className="flex items-center gap-3">
                <img 
                    src={logoUrl} 
                    alt="Planagro" 
                    className="h-8 object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = document.getElementById('logo-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                        if (fallback) fallback.classList.add('flex');
                    }}
                />
                <div id="logo-fallback" className="hidden items-center gap-1">
                     <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Leaf className="text-white" size={16} />
                     </div>
                     <span className="text-xl font-bold text-[#006837]">Planagro</span>
                </div>
            </div>
        </div>
      )}
    </header>
  );
}

function NavBar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: "guia", label: "Guia", icon: BookOpen },
    { id: "calc", label: "Calc", icon: Calculator },
    { id: "diagnose", label: "Diagnose", icon: Camera },
    { id: "chat", label: "IA", icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive ? "text-[#006837]" : "text-gray-400 hover:text-gray-500"
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// --- Features ---

function GuiaSection({ onItemClick, onCalculatorClick }: { onItemClick: (item: any) => void; onCalculatorClick: (calc: string) => void }) {
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [headerTitle, setHeaderTitle] = useState("Guia Agronômico");

  const categories = [
    { id: 'doenca', label: 'Doenças', icon: AlertTriangle, color: 'bg-red-50 text-red-700' },
    { id: 'praga', label: 'Pragas', icon: Bug, color: 'bg-orange-50 text-orange-700' },
    { id: 'deficiencia', label: 'Deficiências', icon: Leaf, color: 'bg-yellow-50 text-yellow-700' },
    { id: 'injuria', label: 'Injúrias', icon: Thermometer, color: 'bg-orange-100 text-orange-800' },
    { id: 'produto', label: 'Produtos', icon: FlaskConical, color: 'bg-blue-50 text-blue-700' },
    { id: 'conversoes', label: 'Conversões', icon: ArrowRightLeft, color: 'bg-purple-50 text-purple-700', isAction: true },
    { id: 'topico', label: 'Manual Geral', icon: BookOpen, color: 'bg-green-50 text-green-700' },
  ];

  const handleCategoryClick = (catId: string, label: string, isAction?: boolean) => {
    if (isAction && catId === 'conversoes') {
        onCalculatorClick('conversoes');
        return;
    }
    setFilterType(catId);
    setHeaderTitle(label);
    setView('list');
  };

  const handleBack = () => {
    setView('dashboard');
    setFilterType(null);
    setSearchTerm("");
    setHeaderTitle("Guia Agronômico");
  };

  // Filter Data Logic
  const filteredData = MANUAL_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'topico') {
        return matchesSearch && (item.type === 'topico' || !item.type);
    }
    
    if (filterType) {
        return matchesSearch && item.type === filterType;
    }
    
    return matchesSearch; 
  });

  if (view === 'dashboard') {
    return (
      <div className="pt-20 pb-24 px-4">
         <h2 className="text-xl font-bold text-[#006837] mb-6">O que você procura hoje?</h2>
         
         <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id, cat.label, cat.isAction)}
                    className={`${cat.color} p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform border border-transparent hover:border-gray-200 h-32`}
                >
                    <cat.icon size={28} />
                    <span className="font-bold text-sm text-center">{cat.label}</span>
                </button>
            ))}
         </div>

         {/* Quick Links or Recent (Optional) */}
         <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Destaques</h3>
            <div className="space-y-3">
                 <div onClick={() => onItemClick(MANUAL_DATA.find(d => d.id === 'nutri-1'))} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#006837] cursor-pointer flex justify-between items-center">
                    <div>
                        <span className="text-xs text-[#8CC63F] font-bold">IMPORTANTE</span>
                        <h4 className="font-bold text-gray-800">Cálculo de Calagem</h4>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                 </div>
                 <div onClick={() => onCalculatorClick('conversoes')} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500 cursor-pointer flex justify-between items-center">
                    <div>
                        <span className="text-xs text-purple-500 font-bold">FERRAMENTA</span>
                        <h4 className="font-bold text-gray-800">Conversor de Unidades</h4>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                 </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 px-4">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={handleBack} className="bg-gray-200 p-2 rounded-full text-gray-600 hover:bg-gray-300">
            <ArrowLeft size={20} />
        </button>
        <div className="relative flex-1">
            <input
            type="text"
            placeholder={`Buscar em ${headerTitle}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006837] bg-white text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>
      </div>
      
      <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">{headerTitle}</h2>

      <div className="space-y-4">
        {filteredData.map((item) => (
          <div 
            key={item.id}
            onClick={() => onItemClick(item)}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md flex gap-4"
          >
            {/* Thumbnail */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Leaf size={24} />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#8CC63F] uppercase tracking-wider truncate mb-1">{item.category}</span>
                    {item.hasCalculator && <Calculator size={14} className="text-[#006837]" />}
                </div>
                <h3 className="text-base font-bold text-gray-800 leading-tight mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2">
                {item.content}
                </p>
            </div>
          </div>
        ))}
        
        {filteredData.length === 0 && (
            <div className="text-center py-10 text-gray-400">
                <p>Nenhum item encontrado nesta categoria.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function TopicDetail({ item, onBack }: { item: any; onBack: () => void }) {
  const paragraphs = item.content.split('\n\n');

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <Header title={item.category} goBack={onBack} />
      <div className="pt-16">
        {item.imageUrl && (
            <div className="w-full h-64 bg-gray-200">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
        )}
        
        <div className="px-4 -mt-6 relative z-10">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-t-4 border-[#006837]">
            <h1 className="text-2xl font-bold text-[#006837] mb-4">{item.title}</h1>
            <div className="prose prose-green prose-sm sm:prose-base text-gray-700">
                {paragraphs.map((para: string, idx: number) => (
                <p key={idx} className="mb-4 whitespace-pre-line leading-relaxed">{para}</p>
                ))}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
                {item.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                    #{tag}
                </span>
                ))}
            </div>
            </div>

            {item.hasCalculator === 'calagem' && <CalagemCalculator />}
            {item.hasCalculator === 'produtividade' && <ProdutividadeCalculator />}
        </div>
      </div>
    </div>
  );
}

// --- Calculators ---

function SpeedCalculator() {
  const [dist, setDist] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // V = (Dist/Time) * 3.6
    const d = parseFloat(dist);
    const t = parseFloat(time);
    if (d > 0 && t > 0) {
      setResult((d / t) * 3.6);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
       <div className="flex items-center gap-2 mb-4 text-blue-700">
        <Timer size={24} />
        <h3 className="font-bold text-lg">Velocidade de Deslocamento</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Distância (m)</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-blue-500 outline-none" value={dist} onChange={e => setDist(e.target.value)} placeholder="50" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Tempo (s)</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-blue-500 outline-none" value={time} onChange={e => setTime(e.target.value)} placeholder="30" />
        </div>
      </div>
      <button onClick={calculate} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Calcular</button>
      {result !== null && (
        <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-blue-800">{result.toFixed(1)} <span className="text-sm">km/h</span></p>
        </div>
      )}
    </div>
  );
}

function PopulationCalculator() {
  const [spacing, setSpacing] = useState("");
  const [plantsM, setPlantsM] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // Pop/ha = (10000 / Spacing) * PlantsPerMeter
    const s = parseFloat(spacing);
    const p = parseFloat(plantsM);
    if (s > 0 && p > 0) {
        const linearMeters = 10000 / s;
        setResult(linearMeters * p);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
       <div className="flex items-center gap-2 mb-4 text-green-700">
        <Sprout size={24} />
        <h3 className="font-bold text-lg">População de Plantas</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Espaçamento (m)</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-green-500 outline-none" value={spacing} onChange={e => setSpacing(e.target.value)} placeholder="0.45" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Plantas/metro</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-green-500 outline-none" value={plantsM} onChange={e => setPlantsM(e.target.value)} placeholder="12.2" />
        </div>
      </div>
      <button onClick={calculate} className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Calcular</button>
      {result !== null && (
        <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-green-800">{result.toLocaleString('pt-BR', {maximumFractionDigits: 0})} <span className="text-sm">plantas/ha</span></p>
        </div>
      )}
    </div>
  );
}

function MoistureCalculator() {
  const [weight, setWeight] = useState("");
  const [currMoist, setCurrMoist] = useState("16");
  const [targetMoist, setTargetMoist] = useState("13");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // Peso Corrigido = Peso * (100 - Atual) / (100 - Desejada)
    const w = parseFloat(weight);
    const c = parseFloat(currMoist);
    const t = parseFloat(targetMoist);
    
    if (w > 0) {
        setResult(w * (100 - c) / (100 - t));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
       <div className="flex items-center gap-2 mb-4 text-yellow-700">
        <Scale size={24} />
        <h3 className="font-bold text-lg">Correção de Umidade</h3>
      </div>
      <div className="mb-3">
          <label className="block text-xs font-bold text-gray-500 mb-1">Peso do Lote (kg)</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-yellow-500 outline-none" value={weight} onChange={e => setWeight(e.target.value)} placeholder="1000" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Umidade Atual %</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-yellow-500 outline-none" value={currMoist} onChange={e => setCurrMoist(e.target.value)} placeholder="16" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Umidade Desejada %</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-yellow-500 outline-none" value={targetMoist} onChange={e => setTargetMoist(e.target.value)} placeholder="13" />
        </div>
      </div>
      <button onClick={calculate} className="w-full py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700">Calcular Peso Líquido</button>
      {result !== null && (
        <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-yellow-800">{result.toFixed(1)} <span className="text-sm">kg</span></p>
            <p className="text-xs text-red-500 font-bold">Quebra: {(parseFloat(weight) - result).toFixed(1)} kg</p>
        </div>
      )}
    </div>
  );
}

function SeederCalculator() {
    const [type, setType] = useState<'adubo' | 'semente'>('adubo');
    const [spacing, setSpacing] = useState("0.45");
    // Adubo
    const [doseKg, setDoseKg] = useState("350");
    // Semente
    const [pop, setPop] = useState("300000");
    const [germ, setGerm] = useState("90");
    
    const [result, setResult] = useState<string>("");

    const calculate = () => {
        const s = parseFloat(spacing);
        const linearMetersPerHa = 10000 / s;
        
        if (type === 'adubo') {
            const dose = parseFloat(doseKg);
            // g/m = (kg/ha * 1000) / (m/ha)
            const res = (dose * 1000) / linearMetersPerHa;
            setResult(`${res.toFixed(1)} g/metro`);
        } else {
            const dens = parseFloat(pop);
            const g = parseFloat(germ) / 100;
            // Real Seeds/ha = Desired / Germination
            // Seeds/m = Real Seeds / linearMeters
            const realSeeds = dens / g;
            const res = realSeeds / linearMetersPerHa;
            setResult(`${res.toFixed(1)} sementes/metro`);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-4 text-orange-700">
                <Tractor size={24} />
                <h3 className="font-bold text-lg">Regulagem Plantadeira</h3>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button onClick={() => setType('adubo')} className={`flex-1 py-1 rounded-md text-sm font-bold ${type === 'adubo' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Adubo</button>
                <button onClick={() => setType('semente')} className={`flex-1 py-1 rounded-md text-sm font-bold ${type === 'semente' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Semente</button>
            </div>

            <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">Espaçamento (m)</label>
                <input type="number" className="w-full p-2 border rounded-lg focus:ring-orange-500 outline-none" value={spacing} onChange={e => setSpacing(e.target.value)} />
            </div>

            {type === 'adubo' ? (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Dose Desejada (kg/ha)</label>
                    <input type="number" className="w-full p-2 border rounded-lg focus:ring-orange-500 outline-none" value={doseKg} onChange={e => setDoseKg(e.target.value)} />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">População (sem/ha)</label>
                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-orange-500 outline-none" value={pop} onChange={e => setPop(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Germinação %</label>
                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-orange-500 outline-none" value={germ} onChange={e => setGerm(e.target.value)} />
                    </div>
                </div>
            )}

            <button onClick={calculate} className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700">Calcular Coleta</button>
            {result && (
                <div className="mt-4 text-center">
                    <p className="text-3xl font-bold text-orange-800">{result}</p>
                </div>
            )}
        </div>
    );
}

function SprayerCalculator() {
    const [mode, setMode] = useState<'calibrar' | 'dose'>('calibrar');
    // Calibrar
    const [area, setArea] = useState("100");
    const [liters, setLiters] = useState("3");
    // Dose
    const [doseHa, setDoseHa] = useState("1500"); // g or ml
    const [volHa, setVolHa] = useState("300");
    const [tank, setTank] = useState("20");

    const [result, setResult] = useState<string>("");

    const calculate = () => {
        if (mode === 'calibrar') {
            const a = parseFloat(area);
            const l = parseFloat(liters);
            // L/ha = (L / m2) * 10000
            const res = (l / a) * 10000;
            setResult(`${res.toFixed(0)} L/ha`);
        } else {
            const d = parseFloat(doseHa);
            const v = parseFloat(volHa);
            const t = parseFloat(tank);
            // tanks per ha = v / t
            // dose per tank = d / tanks per ha = d * t / v
            const res = (d * t) / v;
            setResult(`${res.toFixed(0)} ml ou g / tanque`);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-cyan-500">
            <div className="flex items-center gap-2 mb-4 text-cyan-700">
                <Droplet size={24} />
                <h3 className="font-bold text-lg">Pulverizador Costal</h3>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button onClick={() => setMode('calibrar')} className={`flex-1 py-1 rounded-md text-sm font-bold ${mode === 'calibrar' ? 'bg-white shadow text-cyan-600' : 'text-gray-500'}`}>Calibrar Vazão</button>
                <button onClick={() => setMode('dose')} className={`flex-1 py-1 rounded-md text-sm font-bold ${mode === 'dose' ? 'bg-white shadow text-cyan-600' : 'text-gray-500'}`}>Calcular Dose</button>
            </div>

            {mode === 'calibrar' ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Área Teste (m²)</label>
                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-cyan-500 outline-none" value={area} onChange={e => setArea(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Litros Gastos</label>
                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-cyan-500 outline-none" value={liters} onChange={e => setLiters(e.target.value)} />
                    </div>
                </div>
            ) : (
                <div className="space-y-3 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Dose Bula (ml ou g/ha)</label>
                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-cyan-500 outline-none" value={doseHa} onChange={e => setDoseHa(e.target.value)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Volume Calda (L/ha)</label>
                            <input type="number" className="w-full p-2 border rounded-lg focus:ring-cyan-500 outline-none" value={volHa} onChange={e => setVolHa(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Capac. Tanque (L)</label>
                            <input type="number" className="w-full p-2 border rounded-lg focus:ring-cyan-500 outline-none" value={tank} onChange={e => setTank(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            <button onClick={calculate} className="w-full py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700">Calcular</button>
            {result && (
                <div className="mt-4 text-center">
                    <p className="text-3xl font-bold text-cyan-800">{result}</p>
                </div>
            )}
        </div>
    );
}

function HarvestLossCalculator() {
    const [g1, setG1] = useState("143");
    const [g2, setG2] = useState("131");
    const [g3, setG3] = useState("109");
    const [pms, setPms] = useState("190"); // g
    const [result, setResult] = useState<string>("");

    const calculate = () => {
        const avg = (parseFloat(g1) + parseFloat(g2) + parseFloat(g3)) / 3;
        const weightOneGrain = parseFloat(pms) / 1000; // g
        
        // Loss g/m2 = avg grains * weightOneGrain
        // Loss kg/ha = Loss g/m2 * 10
        
        const lossKgHa = avg * weightOneGrain * 10;
        const lossSc = lossKgHa / 60;
        
        setResult(`${lossKgHa.toFixed(1)} kg/ha (${lossSc.toFixed(1)} sc)`);
    };

    return (
         <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-4 text-red-700">
                <AlertTriangle size={24} />
                <h3 className="font-bold text-lg">Perdas na Colheita</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Amostra 1 (gr/m²)</label>
                    <input type="number" className="w-full p-2 border rounded-lg focus:ring-red-500 outline-none" value={g1} onChange={e => setG1(e.target.value)} />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Amostra 2</label>
                    <input type="number" className="w-full p-2 border rounded-lg focus:ring-red-500 outline-none" value={g2} onChange={e => setG2(e.target.value)} />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Amostra 3</label>
                    <input type="number" className="w-full p-2 border rounded-lg focus:ring-red-500 outline-none" value={g3} onChange={e => setG3(e.target.value)} />
                </div>
            </div>
             <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Peso de 1000 grãos (g)</label>
                <input type="number" className="w-full p-2 border rounded-lg focus:ring-red-500 outline-none" value={pms} onChange={e => setPms(e.target.value)} />
            </div>

            <button onClick={calculate} className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Calcular Perda</button>
            {result && (
                <div className="mt-4 text-center">
                    <p className="text-2xl font-bold text-red-800">{result}</p>
                </div>
            )}
        </div>
    );
}

function ConversionCalculator() {
    const [category, setCategory] = useState<'area' | 'peso' | 'comprimento' | 'temperatura'>('area');
    const [value, setValue] = useState("");
    const [fromUnit, setFromUnit] = useState("");
    const [toUnit, setToUnit] = useState("");
    const [result, setResult] = useState<string>("");

    // Configuration for units
    const units: any = {
        area: [
            { id: 'ha', label: 'Hectare (ha)', factor: 10000 }, // base m2
            { id: 'm2', label: 'Metro Quadrado (m²)', factor: 1 },
            { id: 'alq_sp', label: 'Alqueire Paulista (2.42ha)', factor: 24200 },
            { id: 'alq_mg', label: 'Alqueire Mineiro (4.84ha)', factor: 48400 },
            { id: 'ac', label: 'Acre', factor: 4046.86 }
        ],
        peso: [
            { id: 'kg', label: 'Quilograma (kg)', factor: 1 },
            { id: 'ton', label: 'Tonelada (t)', factor: 1000 },
            { id: 'sc_soja', label: 'Saca Soja/Milho (60kg)', factor: 60 },
            { id: 'qq', label: 'Quintal (100kg)', factor: 100 },
            { id: 'lb', label: 'Libra (lb)', factor: 0.453592 }
        ],
        comprimento: [
            { id: 'm', label: 'Metro (m)', factor: 1 },
            { id: 'cm', label: 'Centímetro (cm)', factor: 0.01 },
            { id: 'mm', label: 'Milímetro (mm)', factor: 0.001 },
            { id: 'in', label: 'Polegada (in)', factor: 0.0254 }
        ],
        temperatura: [
            { id: 'c', label: 'Celsius (°C)' },
            { id: 'f', label: 'Fahrenheit (°F)' }
        ]
    };

    // Set defaults when category changes
    useEffect(() => {
        setFromUnit(units[category][0].id);
        setToUnit(units[category][1]?.id || units[category][0].id);
        setResult("");
        setValue("");
    }, [category]);

    const calculate = () => {
        const val = parseFloat(value);
        if (isNaN(val)) {
            setResult("");
            return;
        }

        if (category === 'temperatura') {
            if (fromUnit === 'c' && toUnit === 'f') {
                setResult(((val * 9/5) + 32).toFixed(2));
            } else if (fromUnit === 'f' && toUnit === 'c') {
                setResult(((val - 32) * 5/9).toFixed(2));
            } else {
                setResult(val.toFixed(2));
            }
            return;
        }

        // Factor based calculation
        const fromFactor = units[category].find((u: any) => u.id === fromUnit)?.factor;
        const toFactor = units[category].find((u: any) => u.id === toUnit)?.factor;

        if (fromFactor && toFactor) {
            // Convert to base then to target
            const base = val * fromFactor;
            const final = base / toFactor;
            
            // Format nicely
            let formatted = final.toFixed(4);
            if (final > 100) formatted = final.toFixed(2);
            if (Number.isInteger(final)) formatted = final.toString();
            
            setResult(formatted);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-4 text-purple-700">
                <ArrowRightLeft size={24} />
                <h3 className="font-bold text-lg">Conversor de Unidades</h3>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {['area', 'peso', 'comprimento', 'temperatura'].map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setCategory(cat as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap capitalize ${
                            category === cat 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Valor</label>
                    <input 
                        type="number" 
                        className="w-full p-3 border rounded-xl focus:ring-purple-500 focus:border-purple-500 outline-none text-lg font-mono" 
                        value={value} 
                        onChange={e => setValue(e.target.value)} 
                        placeholder="0" 
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">De</label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                            value={fromUnit}
                            onChange={e => setFromUnit(e.target.value)}
                        >
                            {units[category].map((u: any) => (
                                <option key={u.id} value={u.id}>{u.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Para</label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                            value={toUnit}
                            onChange={e => setToUnit(e.target.value)}
                        >
                            {units[category].map((u: any) => (
                                <option key={u.id} value={u.id}>{u.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button 
                onClick={calculate} 
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold mb-4 hover:bg-purple-700 transition-colors"
            >
                Converter
            </button>

            {result !== "" && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                    <p className="text-sm text-purple-800 mb-1">Resultado:</p>
                    <p className="text-3xl font-bold text-purple-900">{result} <span className="text-sm font-normal text-purple-600">{units[category].find((u:any) => u.id === toUnit)?.id}</span></p>
                </div>
            )}
        </div>
    );
}

function CalagemCalculator() {
  const [v2, setV2] = useState<string>(""); // Desired
  const [v1, setV1] = useState<string>(""); // Current
  const [ctc, setCtc] = useState<string>("");
  const [prnt, setPrnt] = useState<string>("100");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const v2Num = parseFloat(v2);
    const v1Num = parseFloat(v1);
    const ctcNum = parseFloat(ctc);
    const prntNum = parseFloat(prnt);

    if (!isNaN(v2Num) && !isNaN(v1Num) && !isNaN(ctcNum) && !isNaN(prntNum) && prntNum > 0) {
      // NC = (V2 - V1) * CTC / 100
      // Adjustment for PRNT: Result * (100/PRNT)
      const nc = ((v2Num - v1Num) * ctcNum) / 100;
      const final = nc * (100 / prntNum);
      setResult(final > 0 ? final : 0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-[#8CC63F]">
      <div className="flex items-center gap-2 mb-4 text-[#006837]">
        <Calculator size={24} />
        <h3 className="font-bold text-lg">Calculadora de Calagem</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">V% Atual (Análise)</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={v1} onChange={e => setV1(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">V% Desejado</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={v2} onChange={e => setV2(e.target.value)} placeholder="Ex: 60" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">CTC (cmol/dm³)</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={ctc} onChange={e => setCtc(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">PRNT do Calcário %</label>
          <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={prnt} onChange={e => setPrnt(e.target.value)} placeholder="100" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-[#006837] text-white rounded-xl font-bold mb-4 hover:bg-[#00522b] transition-colors">
        Calcular
      </button>

      {result !== null && (
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
          <p className="text-sm text-green-800 mb-1">Necessidade de Calcário:</p>
          <p className="text-3xl font-bold text-[#006837]">{result.toFixed(2)} <span className="text-sm font-normal text-gray-600">t/ha</span></p>
        </div>
      )}
    </div>
  );
}

function ProdutividadeCalculator() {
  const [plants, setPlants] = useState("");
  const [pods, setPods] = useState("");
  const [grains, setGrains] = useState("");
  const [weight, setWeight] = useState("160"); // PMS default
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    // Formula approximation
    const p = parseFloat(plants) * 1000; // input in thousands/ha // Note: User file says population is total, but UI asks for thousands/ha. Kept consistent with previous logic.
    // If user enters 271108 (full number), logic needs adjustment or label. 
    // Let's assume input matches the placeholder "Ex: 240" (thousand). 
    
    // File Formula: Pop * Pods * Grains * (Weight/1000) -> Result in grams? No, result in kg/ha directly?
    // Let's stick to: (Plants/ha * Pods * Grains * Weight_g) / 1000 (to mg) / 1000 (to kg)
    
    let p_real = parseFloat(plants);
    if(p_real < 1000) p_real = p_real * 1000; // Auto-detect if user entered '240' (k) or '240000'

    const v = parseFloat(pods);
    const g = parseFloat(grains);
    const w = parseFloat(weight);

    if (p_real && v && g && w) {
       const kgHa = (p_real * v * g * w) / 1000000; // (Plants * Pods * Grains * g) / 1,000,000 = kg
       setResult(kgHa);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-[#8CC63F]">
      <div className="flex items-center gap-2 mb-4 text-[#006837]">
        <Calculator size={24} />
        <h3 className="font-bold text-lg">Estimativa de Produtividade</h3>
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">População (plantas/ha)</label>
            <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={plants} onChange={e => setPlants(e.target.value)} placeholder="Ex: 240000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Vagens/Planta</label>
            <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={pods} onChange={e => setPods(e.target.value)} placeholder="Ex: 40" />
            </div>
            <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Grãos/Vagem</label>
            <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={grains} onChange={e => setGrains(e.target.value)} placeholder="Ex: 2.3" />
            </div>
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Peso de 1000 grãos (g)</label>
            <input type="number" className="w-full p-2 border rounded-lg focus:ring-[#006837] focus:border-[#006837] outline-none" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ex: 160" />
        </div>
      </div>

      <button onClick={calculate} className="w-full py-3 bg-[#006837] text-white rounded-xl font-bold mb-4 hover:bg-[#00522b] transition-colors">
        Calcular Estimativa
      </button>

      {result !== null && (
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
          <p className="text-sm text-green-800 mb-1">Produtividade Estimada:</p>
          <p className="text-3xl font-bold text-[#006837]">{result.toFixed(0)} <span className="text-sm font-normal text-gray-600">kg/ha</span></p>
          <p className="text-sm text-gray-500">{(result / 60).toFixed(1)} sacas/ha</p>
        </div>
      )}
    </div>
  );
}

// --- Diagnosis Feature ---

function DiagnoseSection() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: "Você é um agrônomo especialista do Guia Planagro. Analise esta imagem detalhadamente. 1) Identifique se há pragas, doenças ou deficiência nutricional. Se for uma planta saudável, diga isso. 2) Se houver problema, nomeie o agente causal (científico e comum). 3) Sugira manejo e controle baseado em boas práticas agronômicas. Use formatação clara." }
                ]
            }
        });
        
        setAnalysis(response.text || "Não foi possível analisar a imagem.");
    } catch (error) {
        setAnalysis("Erro ao conectar com o serviço de análise. Verifique sua conexão.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-24 px-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center border border-gray-100">
        <h2 className="text-xl font-bold text-[#006837] mb-2">Diagnóstico por Imagem</h2>
        <p className="text-gray-500 text-sm mb-6">Tire uma foto da folha, fruto ou planta inteira para identificar pragas e doenças.</p>

        {!image ? (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#8CC63F] bg-green-50 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 transition-colors"
            >
                <div className="bg-[#006837] text-white p-4 rounded-full mb-3 shadow-lg">
                    <Camera size={32} />
                </div>
                <span className="font-medium text-[#006837]">Toque para fotografar</span>
                <span className="text-xs text-gray-500 mt-1">ou selecionar da galeria</span>
            </div>
        ) : (
            <div className="relative rounded-xl overflow-hidden shadow-lg mb-4">
                <img src={image} alt="Preview" className="w-full h-64 object-cover" />
                <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                    <X size={20} />
                </button>
            </div>
        )}

        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCapture} 
            accept="image/*" 
            capture="environment" // Prefer rear camera on mobile
            className="hidden" 
        />

        {image && !analysis && (
            <button 
                onClick={analyzeImage}
                disabled={loading}
                className="w-full mt-4 py-3 bg-[#006837] text-white rounded-xl font-bold hover:bg-[#00522b] flex items-center justify-center gap-2 transition-colors"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                {loading ? "Analisando..." : "Identificar Problema"}
            </button>
        )}
      </div>

      {analysis && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-[#8CC63F]">
              <h3 className="font-bold text-lg text-[#006837] mb-3 flex items-center gap-2">
                  <Leaf size={20} /> Resultado da Análise
              </h3>
              <div className="prose prose-sm prose-green max-w-none text-gray-700 whitespace-pre-wrap">
                  {analysis}
              </div>
          </div>
      )}
    </div>
  );
}

// --- Chat Section ---

function ChatSection() {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Context injection
            const systemContext = "Você é um assistente virtual do aplicativo Guia Agronômico Planagro. Sua base de conhecimento inclui amostragem de solo, nutrição (calagem, adubação), pragas e doenças de grandes culturas (Soja, Milho, Trigo). Responda de forma técnica mas acessível a produtores rurais. Use as cores da Planagro (verde) na formatação se possível (markdown).";
            
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: systemContext }
            });
            
            const result = await chat.sendMessage({ message: userMsg });
            setMessages(prev => [...prev, { role: 'model', text: result.text }]);

        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Desculpe, estou com dificuldade de conexão no momento." }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-screen pt-16 pb-20 bg-gray-100">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <Leaf size={48} className="mb-2 text-[#006837]" />
                        <p className="text-center font-medium">Olá! Sou o assistente da Planagro.</p>
                        <p className="text-center text-sm">Pergunte sobre adubação, pragas ou correção de solo.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            m.role === 'user' 
                            ? 'bg-[#006837] text-white rounded-br-none shadow-md' 
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-200'
                        }`}>
                            <div className="whitespace-pre-wrap">{m.text}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-white p-3 border-t flex gap-2">
                <input 
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                    placeholder="Digite sua dúvida..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="p-2 bg-[#006837] text-white rounded-full disabled:opacity-50 hover:bg-[#00522b] transition-colors"
                >
                    <Search size={20} />
                </button>
            </div>
        </div>
    );
}

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState("guia");
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  
  // Specific state to handle direct navigation to calculator tab if needed
  const [showConversionCalc, setShowConversionCalc] = useState(false);

  const handleCalculatorNavigation = (calc: string) => {
    if (calc === 'conversoes') {
        setActiveTab("calc");
        setShowConversionCalc(true);
    }
  };

  const renderContent = () => {
    if (selectedTopic) {
      return <TopicDetail item={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }

    switch (activeTab) {
      case "guia":
        return (
          <>
            <Header title="Guia" />
            <GuiaSection onItemClick={setSelectedTopic} onCalculatorClick={handleCalculatorNavigation} />
          </>
        );
      case "calc":
        return (
          <>
             <Header title="Calculadoras" />
             <div className="pt-20 pb-24 px-4 space-y-6">
                 {/* Re-order to put Conversions first if triggered by button */}
                 {showConversionCalc && <ConversionCalculator />}
                 <PopulationCalculator />
                 <SeederCalculator />
                 <SprayerCalculator />
                 <SpeedCalculator />
                 <HarvestLossCalculator />
                 <MoistureCalculator />
                 <CalagemCalculator />
                 <ProdutividadeCalculator />
                 {!showConversionCalc && <ConversionCalculator />}
             </div>
          </>
        );
      case "diagnose":
        return (
          <>
            <Header title="Diagnose" />
            <DiagnoseSection />
          </>
        );
      case "chat":
        return (
            <>
                <Header title="IA Planagro" />
                <ChatSection />
            </>
        );
      default:
        return <GuiaSection onItemClick={setSelectedTopic} onCalculatorClick={handleCalculatorNavigation} />;
    }
  };

  // Reset calculator highlight when leaving calc tab
  if (activeTab !== 'calc' && showConversionCalc) {
      setShowConversionCalc(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-green-100">
      {renderContent()}
      {!selectedTopic && <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
