import { useEffect, useRef } from 'react'
import type { BrandMode } from '../hooks/featureFlagsContext'
import type { ProductMode } from '../types/home'

const productLabelsByBrand: Record<BrandMode, Record<ProductMode, string>> = {
  pitaco: {
    apostas: 'APOSTAS',
    cassino: 'CASSINO',
  },
  draftea: {
    apostas: 'BETS',
    cassino: 'GAMING',
  },
}

const exactDrafteaTranslations: Record<string, string> = {
  'Abrir depósito. Saldo disponível: R$ 3.400,00': 'Abrir depósito. Saldo disponible: R$ 3.400,00',
  'Abrir feature flags': 'Abrir feature flags',
  'Abrir menu': 'Abrir menú',
  'Acessar Club': 'Acceder al Club',
  'AMANHÃ 12:30': 'MAÑANA 12:30',
  'Amanhã': 'Mañana',
  'AO VIVO': 'Live',
  'Ao Vivo': 'Live',
  'Ao vivo': 'Live',
  'APOSTAS': 'BETS',
  'Apostas': 'Bets',
  'Apostas Ao Vivo': 'Live Bets',
  'Apostas Gratis disponivel': 'Free Bets available',
  'Aposte e ganhe R$10': 'Bet and win R$10',
  'Aposte nas seleções da copa e ganhe R$10.': 'Bet on the copa selections and win R$10.',
  'APOSTE': 'BET',
  'Ativa a experiencia em prototipo de Apostas Gratis.': 'Enable the Free Bets prototype experience.',
  'Ativar': 'Enable',
  'BASQUETE': 'BASQUETBOL',
  'Basquete': 'Basquetbol',
  'Buscar': 'Buscar',
  'CASSINO': 'GAMING',
  'Cassino': 'Gaming',
  'Cassino Ao Vivo': 'Live Gaming',
  'Cassino ao vivo': 'Live Gaming',
  'Cashback 30% de volta': 'Cashback 30% de vuelta',
  'Chutes Totais': 'Tiros totales',
  'Club': 'Club',
  'Complete tarefas da NBA no Pitaco e ganhe.': 'Completa misiones de la NBA en Draftea y gana.',
  'Complete tarefas e ganhe': 'Completa misiones y gana',
  'COMPLETE': 'COMPLETA',
  'Conteúdo': 'Contenido',
  'Destaques': 'Destacados',
  'Desativar Apostas Gratis disponivel': 'Disable Free Bets available',
  'Desativar': 'Disable',
  'Dribles Completos': 'Regates completos',
  'E GANHE': 'Y GANA',
  'EM BREVE': 'PRONTO',
  'EMPATE': 'EMPATE',
  'Entrada max. R$350': 'Entrada máx. R$350',
  'Entradas': 'Entradas',
  'Escolha a experiência carregada no protótipo.': 'Elige la experiencia cargada en el prototipo.',
  'Esportes': 'Deportes',
  'Fechar': 'Cerrar',
  'Finalizações no Gol': 'Tiros al arco',
  'Finalizações ao gol': 'Tiros al arco',
  'Futebol': 'Fútbol',
  'FUTEBOL': 'FÚTBOL',
  'Filtros de conteúdo': 'Filtros de contenido',
  'Flamengo na liberta é aqui': 'Flamengo en la Liberta está aquí',
  'FLAMENGO NA LIBERTA É AQUI': 'FLAMENGO EN LA LIBERTA ESTÁ AQUÍ',
  'Ganhe R$20': 'Gana R$20',
  'GANHE R$20': 'GANA R$20',
  'Ganhando Agora': 'Ganando Ahora',
  'Ganhando agora no nosso Cassino': 'Ganando ahora en nuestro Gaming',
  'Handcap': 'Spread',
  'Handicap': 'Spread',
  'Hoje': 'Hoy',
  'HOJE 15:00': 'HOY 15:00',
  'HOJE 17:30': 'HOY 17:30',
  'HOJE 20:00': 'HOY 20:00',
  'JOGADORES': 'JUGADORES',
  'Mais': 'Más',
  'Min. 3+ seleções de 1.40+': 'Mín. 3+ selecciones de 1.40+',
  'Minhas Apostas': 'My Bets',
  'Minhas apostas': 'My Bets',
  'Missões': 'Misiones',
  'Novidades': 'Novedades',
  'Ofertas': 'Ofertas',
  'Partidas': 'Partidos',
  'PARTIDAS AO VIVO': 'LIVE MATCHES',
  'PARTIDAS EM BREVE': 'PARTIDOS PRÓXIMOS',
  'Pitaco Club': 'Rewards',
  'Pitaco Recomenda': 'Draftea Recomienda',
  'POPULARES': 'POPULARES',
  'Principais': 'Principales',
  'Produto': 'Producto',
  'Promoções': 'Promociones',
  'Promocoes': 'Promociones',
  'Regras de Jogos e Apostas': 'Game and Bets Rules',
  'RESULTADO FINAL': 'Moneyline',
  'Saldo': 'Saldo',
  'SALDO': 'SALDO',
  'Seleções da copa': 'Selecciones de la copa',
  'TAREFAS': 'MISIONES',
  'Tênis': 'Tenis',
  'Tesouro do Pitaco': 'Tesoro de Draftea',
  'Todas as Promoções': 'Todas las Promociones',
  'Total de Gols': 'Total de Goles',
  'Vencer': 'Gana',
  'Ver mais': 'Ver más',
  'Ver regras': 'Ver reglas',

  // --- Mercados esportivos (página de evento / competição) ---
  'Resultado Final': 'Moneyline',
  'Resultado final': 'Moneyline',
  'Vencedor': 'Ganador',
  'Total de Pontos': 'Total de Puntos',
  'Total de Escanteios': 'Total de Córners',
  'Total de Cartões': 'Total de Tarjetas',
  'Total de gols': 'Total de Goles',
  'Dupla Chance': 'Doble Oportunidad',
  'Ambas Marcam': 'Ambos Anotan',
  'Ambos Marcam': 'Ambos Anotan',
  'Ambas marcam': 'Ambos Anotan',
  'Sim Para Marcar Gol': 'Sí Para Anotar Gol',
  'Pontos do Jogador': 'Puntos del Jugador',
  'Pontos da Equipe': 'Puntos del Equipo',
  'Pontos de jogador': 'Puntos del jugador',
  'Assistências do Jogador': 'Asistencias del Jugador',
  'Assistências': 'Asistencias',
  'Rebotes do Jogador': 'Rebotes del Jugador',
  'Retorno do Jogador': 'Retorno del Jugador',
  'Finalizações ao Gol': 'Tiros al Arco',
  'Finalização ao Gol': 'Tiro al Arco',
  'Finalização Total': 'Tiros Totales',
  'Pontos': 'Puntos',
  'Gols': 'Goles',
  'Bolas de 3': 'Triples',
  'Cartões': 'Tarjetas',
  'CARTÕES': 'TARJETAS',
  'Escanteios': 'Córners',
  'Criar Aposta': 'Crear Apuesta',
  'CRIAR APOSTA': 'CREAR APUESTA',
  'Handicap de Games': 'Spread de Games',
  'Jogador': 'Jugador',
  'Jogadores': 'Jugadores',
  'TIMES': 'EQUIPOS',
  'Times': 'Equipos',
  'Vence a partida': 'Gana el partido',
  'Casa ou Empate': 'Local o Empate',
  'Casa ou Fora': 'Local o Visitante',
  'Fora ou Empate': 'Visitante o Empate',
  '3° Quarto - Total de Pontos': '3° Cuarto - Total de Puntos',
  '4° Quarto - Total de Pontos': '4° Cuarto - Total de Puntos',
  '1º Quarto': '1º Cuarto',
  '2º Quarto': '2º Cuarto',
  'Quadra': 'Cancha',
  'Visão da Quadra': 'Vista de la Cancha',
  'Visão do Campo': 'Vista del Campo',
  'Visualização do jogo': 'Visualización del partido',
  'Estatísticas de': 'Estadísticas de',
  'Ver mais estatísticas': 'Ver más estadísticas',
  'Recolher': 'Contraer',
  'Recolher mercado': 'Contraer mercado',
  'Navegação do evento': 'Navegación del evento',
  'Fechar evento': 'Cerrar evento',
  'Fechar transmissão': 'Cerrar transmisión',
  'Transmissão': 'Transmisión',
  'Transmissão ao vivo': 'Transmisión en vivo',
  'Transmissão do evento': 'Transmisión del evento',
  'Tela cheia': 'Pantalla completa',
  'Mudo': 'Silenciar',

  // --- Competição / torneios / longo prazo ---
  'Longo Prazo': 'Largo Plazo',
  'Torneio': 'Torneo',
  'Campeão': 'Campeón',
  'Campeão do Leste': 'Campeón del Este',
  'Rebaixamento': 'Descenso',
  'Artilheiro': 'Goleador',
  'Artilheiro na área!': '¡Goleador del área!',
  'Mais assistências': 'Más asistencias',
  'Mais bolas de 3': 'Más triples',
  'Mais pontos': 'Más puntos',
  'Melhor jogador': 'Mejor jugador',
  'Final de conferência': 'Final de conferencia',
  'MVP das finais': 'MVP de las finales',

  // --- Esportes ---
  'Vôlei': 'Voleibol',
  'Boxe': 'Boxeo',
  'Handebol': 'Balonmano',
  'Golfe': 'Golf',
  'Hoquei': 'Hockey',
  'Fut. Americano': 'Fút. Americano',
  'Tênis Mesa': 'Tenis de Mesa',

  // --- Seções / status / navegação esportiva ---
  'Jogos': 'Partidos',
  'Jogos do campeonato': 'Partidos del campeonato',
  'Jogos em destaque': 'Partidos destacados',
  'Carregar mais': 'Cargar más',
  'Começa em Breve': 'Comienza Pronto',
  'Em breve': 'Pronto',
  'Intervalo': 'Medio Tiempo',
  'Placar': 'Marcador',
  'Placar:': 'Marcador:',
  'Mais campeonatos': 'Más campeonatos',
  'Mais jogados': 'Más jugados',
  'Mais categorias': 'Más categorías',
  'Voltar': 'Volver',
  'Voltar para esportes': 'Volver a deportes',
  'Ver todas competições': 'Ver todas las competiciones',
  'Ver todas competições de': 'Ver todas las competiciones de',
  'Competições': 'Competiciones',
  'Competições de': 'Competiciones de',
  'Nenhuma competição disponível.': 'Ninguna competición disponible.',
  'Selecione uma competição': 'Selecciona una competición',
  'Busque por uma competição': 'Busca una competición',
  'Outros esportes e competições': 'Otros deportes y competiciones',

  // --- Cassino / página interna de jogo ---
  'Jogue Agora': 'Juega Ahora',
  'Jogar Torneio': 'Jugar Torneo',
  'Jogos com promoção': 'Juegos con promoción',
  'Carregando jogo': 'Cargando juego',
  'Fechar jogo': 'Cerrar juego',
  'Recolher jogo': 'Contraer juego',
  'Informações do jogo': 'Información del juego',
  'Abrir direto este jogo nas próximas vezes': 'Abrir directo este juego las próximas veces',
  'Provedores': 'Proveedores',
  'Bônus e ofertas': 'Bonos y ofertas',
  'Crash e jogos rápidos': 'Crash y juegos rápidos',
  'Super Aumentada': 'Súper Aumentada',
  'Pechincha': 'Ganga',
  '10 Mais Populares': '10 Más Populares',
  'Você também pode gostar:': 'También te puede gustar:',
  'e mais': 'y más',
  'Roleta': 'Ruleta',
  'Brasileiros': 'Brasileños',

  // --- Betslip / cupom ---
  'Aposta': 'Apuesta',
  'Aposta feita!': '¡Apuesta realizada!',
  'Aposta feita com sucesso': 'Apuesta realizada con éxito',
  'Múltipla': 'Parlay',
  'Simples': 'Simple',
  'Resumo': 'Resumen',
  'Tipo de aposta': 'Tipo de apuesta',
  'Valor da aposta': 'Valor de la apuesta',
  'Valor do depósito': 'Valor del depósito',
  'Suas seleções:': 'Tus selecciones:',
  'Nenhuma seleção adicionada': 'Ninguna selección agregada',
  'Remover seleção': 'Quitar selección',
  'Remover escolha': 'Quitar elección',
  'Remover aposta criada': 'Quitar apuesta creada',
  'Remover aposta': 'Quitar apuesta',
  'Remover tudo': 'Quitar todo',
  'Adicionar': 'Agregar',
  'Adicione +1 seleção para': 'Agrega +1 selección para',
  'Para Ganhar': 'Para Ganar',
  'Para ganhar': 'Para ganar',
  'Ganho Max.': 'Ganancia Máx.',
  'Usar crédito de aposta': 'Usar crédito de apuesta',
  'Usar crédito de aposta: R$ 20,00': 'Usar crédito de apuesta: R$ 20,00',
  'Compartilhar aposta': 'Compartir apuesta',
  'Ver Aposta': 'Ver Apuesta',
  'Comprovante da aposta': 'Comprobante de la apuesta',
  'Sua aposta segura': 'Tu apuesta segura',
  'Escolha uma odd para montar sua aposta.': 'Elige una odd para armar tu apuesta.',
  'Múltipla Turbinada': 'Parlay Turbo',
  'Múltipla Turbinada com bônus de': 'Parlay Turbo con bono de',
  'Múltipla Turbinada liberada com': 'Parlay Turbo activado con',
  'Ver como funciona a Múltipla Turbinada': 'Ver cómo funciona el Parlay Turbo',
  'Ver como funciona a Substituição Protegida': 'Ver cómo funciona la Sustitución Protegida',
  'Ver como funciona o Pagamento Antecipado': 'Ver cómo funciona el Pago Anticipado',
  'Apostas com Pechincha ou Aumentadas não acumulam com Múltipla Turbinada.': 'Las apuestas con Ganga o Aumentadas no se acumulan con Parlay Turbo.',
  'Bônus por quantidade de seleções': 'Bono por cantidad de selecciones',
  'Bônus no valor para ganhar': 'Bono en el valor para ganar',
  'Bônus máximo liberado': 'Bono máximo activado',
  'Benefícios disponíveis nesta seleção': 'Beneficios disponibles en esta selección',
  'Navegar entre benefícios': 'Navegar entre beneficios',
  'Vantagens do Pitaco': 'Ventajas de Draftea',
  'Principais escolhas': 'Principales elecciones',
  'Atual': 'Actual',
  'Liberado': 'Activado',
  'Não aplicado': 'No aplicado',
  'Ocultar detalhes': 'Ocultar detalles',
  'Ver detalhes': 'Ver detalles',
  'Substituição Protegida': 'Sustitución Protegida',
  'Substituição Garantida': 'Sustitución Garantizada',
  'Pagamento Antecipado': 'Pago Anticipado',
  'Pag. Antecipado': 'Pag. Anticipado',
  '*Rendem apenas o lucro.': '*Rinden solo la ganancia.',
  'Válido para seleções com odd mínima de 1.30x': 'Válido para selecciones con odd mínima de 1.30x',
  'Falta 1 seleção elegível para desbloquear 5 por cento de Múltipla Turbinada.': 'Falta 1 selección elegible para desbloquear 5 por ciento de Parlay Turbo.',

  // --- Depósito / Pix ---
  'Método de pagamento': 'Método de pago',
  'Apagar': 'Borrar',
  'Apagar valor': 'Borrar valor',
  'Como pagar com Pix?': '¿Cómo pagar con Pix?',
  'Copie o código Pix': 'Copia el código Pix',
  'Cole o código e confirme o pagamento': 'Pega el código y confirma el pago',
  'Gerar código Pix': 'Generar código Pix',
  'Conclua o Pix de R$': 'Completa el Pix de R$',
  'Abra o app do seu banco ou instituição financeira e acesse a área do Pix': 'Abre la app de tu banco o institución financiera y accede al área de Pix',
  'Abrir aplicativo do banco': 'Abrir aplicación del banco',
  'Escolha a opção "Pix Copia e Cola"': 'Elige la opción "Pix Copia y Pega"',
  'Copie o código abaixo, acesse seu banco ou carteira digital e utilize a opção Pix Copia e Cola.': 'Copia el código de abajo, accede a tu banco o billetera digital y usa la opción Pix Copia y Pega.',
  'QR Code Pix de teste': 'QR Code Pix de prueba',
  'Somente serão aceitos depósitos realizados pelo mesmo titular do CPF cadastrado no Rei.': 'Solo se aceptarán depósitos realizados por el mismo titular del CPF registrado en Draftea.',
  'Saldos disponíveis': 'Saldos disponibles',
  'Configurações': 'Configuración',

  // --- Marca / cabeçalho / tesouro ---
  'O Rei do Pitaco é autorizado e em conformidade com as leis': 'Draftea es autorizado y está en conformidad con las leyes',
  'Tesouro': 'Tesoro',
  'do Pitaco': 'de Draftea',
  'Só no Rei': 'Solo en Draftea',
  'Missão': 'Misión',
  'Ativar Missão': 'Activar Misión',
  'Progresso:': 'Progreso:',
  'Termina em 3 dias': 'Termina en 3 días',

  // --- Promoções / missões (banners e cards) ---
  'Drop de Prêmios Wazdan.': 'Drop de Premios Wazdan.',
  'Torneio recheado de': 'Torneo lleno de',
  'prêmios para você.': 'premios para ti.',
  'Quanto mais você aposta,': 'Cuanto más apuestas,',
  'maiores são as chances de': 'mayores son las posibilidades de',
  'ver um prêmio!': '¡ver un premio!',
  'Quanto mais você jogar mais chaves irá conseguir.': 'Cuanto más juegues más llaves conseguirás.',
  'Para você.': 'Para ti.',
  'R$ 100 MIL na hora!': '¡R$ 100 MIL al instante!',
  'Aposte R$100 no jogo Fortune Rabbit e ganhe mais 50 coroas.': 'Apuesta R$100 en el juego Fortune Rabbit y gana 50 coronas más.',
  'Aposte R$100 no jogo Lucky Piggy e ganhe 20 coroas.': 'Apuesta R$100 en el juego Lucky Piggy y gana 20 coronas.',
  'Aposte R$20 no jogo do Ratinho Sortudo e ganhe 5 Rodadas Grátis.': 'Apuesta R$20 en el juego Ratinho Sortudo y gana 5 Giros Gratis.',
  'Favoritos da NBA!': '¡Favoritos de la NBA!',
  // --- Aviso de dispositivo (MobileOnly) ---
  'Versão Mobile Only': 'Versión Solo Móvil',
  'Esta aplicação foi desenhada exclusivamente para dispositivos móveis. Por favor, reduza a largura do seu navegador ou acesse através do seu celular.': 'Esta aplicación fue diseñada exclusivamente para dispositivos móviles. Por favor, reduce el ancho de tu navegador o accede desde tu celular.',
  'Largura máxima suportada: 499px': 'Ancho máximo soportado: 499px',
  'Noite de pontos!': '¡Noche de puntos!',
  'Clássico quente!': '¡Clásico caliente!',
  'Maestro em campo!': '¡Maestro en cancha!',
  'Craque demais!': '¡Crack total!',
  'Chef de três!': '¡Chef de triples!',
  'Tá voando!': '¡Está volando!',
  'Dobradinha da rodada': 'Doblete de la jornada',
  'Combinada top!': '¡Parlay top!',
  'Rodada completa': 'Jornada completa',
  'NA LIBERTA': 'EN LA LIBERTA',
  'Ganhe R$20 com Flamengo na Liberta.': 'Gana R$20 con Flamengo en la Liberta.',
  'COMBINADA': 'PARLAY',
  'SUPER COMBINADA': 'SÚPER PARLAY',
  'GARANTIDA': 'GARANTIZADA',
}

const exactPitacoTranslations = Object.fromEntries(
  Object.entries(exactDrafteaTranslations).map(([pitaco, draftea]) => [draftea, pitaco])
) as Record<string, string>

const drafteaReplacements: [RegExp, string][] = [
  [/Rei do Pitaco/g, 'Draftea'],
  [/Pitaco Club/g, 'Rewards'],
  [/Tesouro do Pitaco/g, 'Tesoro de Draftea'],
  [/Pitaco Recomenda/g, 'Draftea Recomienda'],
  [/NBA no Pitaco/g, 'NBA en Draftea'],
  [/Pitacoins/g, 'Drafteacoins'],
  [/Pitaco/g, 'Draftea'],
  [/Apostas Gratis/g, 'Free Bets'],
  [/Apostas Grátis/g, 'Free Bets'],
  [/Apostas Ao Vivo/g, 'Live Bets'],
  [/Apostas/g, 'Bets'],
  [/APOSTAS/g, 'BETS'],
  [/Desativar/g, 'Disable'],
  [/Ativar/g, 'Enable'],
  [/disponivel/g, 'available'],
  [/Cassino Ao Vivo/g, 'Live Gaming'],
  [/Cassino/g, 'Gaming'],
  [/CASSINO/g, 'GAMING'],
  [/Promoções/g, 'Promociones'],
  [/PROMOÇÕES/g, 'PROMOCIONES'],
  [/Ao Vivo/g, 'Live'],
  [/Ao vivo/g, 'Live'],
  [/AO VIVO/g, 'Live'],
  [/RESULTADO FINAL/g, 'Moneyline'],
  [/Futebol/g, 'Fútbol'],
  [/FUTEBOL/g, 'FÚTBOL'],
  [/Vencer/g, 'Gana'],
  [/Handcap/g, 'Spread'],
  [/Handicap/g, 'Spread'],
  [/Basquete/g, 'Basquetbol'],
  [/BASQUETE/g, 'BASQUETBOL'],
  [/Tênis/g, 'Tenis'],
  [/Destaques/g, 'Destacados'],
  [/Principais/g, 'Principales'],
  [/Ganhando Agora/g, 'Ganando Ahora'],
  [/Novidades/g, 'Novedades'],
  [/Ver mais/g, 'Ver más'],
  [/Ver regras/g, 'Ver reglas'],
  [/Mais/g, 'Más'],
  [/Finalizações no Gol/g, 'Tiros al arco'],
  [/Finalizações ao gol/g, 'Tiros al arco'],
  [/Hoje/g, 'Hoy'],
  [/HOJE/g, 'HOY'],
  [/Amanhã/g, 'Mañana'],
  [/AMANHÃ/g, 'MAÑANA'],
  [/Entrada max\./g, 'Entrada máx.'],
  [/seleções/g, 'selecciones'],
  [/Seleções/g, 'Selecciones'],
  [/TAREFAS/g, 'MISIONES'],
  [/tarefas/g, 'misiones'],
  [/ganhe/g, 'gana'],
  [/Ganhe/g, 'Gana'],
  // Frases compostas / interpoladas (rodam só quando não há match exato)
  [/Criar Aposta/g, 'Crear Apuesta'],
  [/CRIAR APOSTA/g, 'CREAR APUESTA'],
  [/Veja mais/g, 'Ver más'],
  [/Estatísticas/g, 'Estadísticas'],
  [/estatísticas/g, 'estadísticas'],
  [/Faltam/g, 'Faltan'],
  [/elegíveis/g, 'elegibles'],
  [/elegível/g, 'elegible'],
  [/Adicione/g, 'Agrega'],
  [/Adicionar/g, 'Agregar'],
  [/Múltipla Turbinada/g, 'Parlay Turbo'],
  [/Múltipla/g, 'Parlay'],
  [/ou Empate/g, 'o Empate'],
  [/Jogadores de/g, 'Jugadores de'],
  [/por cento/g, 'por ciento'],
  [/Competições/g, 'Competiciones'],
  [/competições/g, 'competiciones'],
  [/Competição/g, 'Competición'],
  [/competição/g, 'competición'],
  [/Nenhuma/g, 'Ninguna'],
  [/Provedores/g, 'Proveedores'],
  [/Bônus/g, 'Bono'],
  [/bônus/g, 'bono'],
  [/Benefícios/g, 'Beneficios'],
  [/benefícios/g, 'beneficios'],
  [/Benefício/g, 'Beneficio'],
  [/Seleção/g, 'Selección'],
  [/seleção/g, 'selección'],
  // Verbos / navegação (aria-labels compostos)
  [/Recolher/g, 'Contraer'],
  [/Voltar para/g, 'Volver a'],
  [/Voltar/g, 'Volver'],
  [/Fechar/g, 'Cerrar'],
  [/Navegação/g, 'Navegación'],
  [/Transmissão/g, 'Transmisión'],
  [/transmissão/g, 'transmisión'],
  [/Tela cheia/g, 'Pantalla completa'],
  [/destaques/g, 'destacados'],
  // Nomes de mercado dentro de strings compostas (ex.: "Recolher Dupla Chance")
  [/Resultado Final/g, 'Moneyline'],
  [/Resultado final/g, 'Moneyline'],
  [/Finalizações ao Gol/g, 'Tiros al Arco'],
  [/Finalização ao Gol/g, 'Tiro al Arco'],
  [/Total de Gols/g, 'Total de Goles'],
  [/Total de Pontos/g, 'Total de Puntos'],
  [/Total de Escanteios/g, 'Total de Córners'],
  [/Total de Cartões/g, 'Total de Tarjetas'],
  [/Dupla Chance/g, 'Doble Oportunidad'],
  [/Ambas Marcam/g, 'Ambos Anotan'],
  [/Ambos Marcam/g, 'Ambos Anotan'],
  [/Pontos do Jogador/g, 'Puntos del Jugador'],
  [/Assistências do Jogador/g, 'Asistencias del Jugador'],
  [/Rebotes do Jogador/g, 'Rebotes del Jugador'],
  // "na hora" usa espaço não separável ( ) na origem; \s cobre ambos
  [/R\$ 100 MIL na\shora!/g, '¡R$ 100 MIL al instante!'],
]

const pitacoReplacements: [RegExp, string][] = [
  [/Rewards/g, 'Pitaco Club'],
  [/Tesoro de Draftea/g, 'Tesouro do Pitaco'],
  [/Draftea Recomienda/g, 'Pitaco Recomenda'],
  [/NBA en Draftea/g, 'NBA no Pitaco'],
  [/Drafteacoins/g, 'Pitacoins'],
  [/Draftea/g, 'Pitaco'],
  [/Free Bets/g, 'Apostas Gratis'],
  [/Live Bets/g, 'Apostas Ao Vivo'],
  [/Bets/g, 'Apostas'],
  [/BETS/g, 'APOSTAS'],
  [/Disable/g, 'Desativar'],
  [/Enable/g, 'Ativar'],
  [/available/g, 'disponivel'],
  [/Live Gaming/g, 'Cassino Ao Vivo'],
  [/Gaming/g, 'Cassino'],
  [/GAMING/g, 'CASSINO'],
  [/Promociones/g, 'Promoções'],
  [/PROMOCIONES/g, 'PROMOÇÕES'],
  [/\bLive\b/g, 'Ao Vivo'],
  [/Moneyline/g, 'RESULTADO FINAL'],
  [/Fútbol/g, 'Futebol'],
  [/FÚTBOL/g, 'FUTEBOL'],
  [/Spread/g, 'Handicap'],
  [/Basquetbol/g, 'Basquete'],
  [/BASQUETBOL/g, 'BASQUETE'],
  [/Tenis/g, 'Tênis'],
  [/Destacados/g, 'Destaques'],
  [/Principales/g, 'Principais'],
  [/Ganando Ahora/g, 'Ganhando Agora'],
  [/Novedades/g, 'Novidades'],
  [/Ver más/g, 'Ver mais'],
  [/Ver reglas/g, 'Ver regras'],
  [/Más/g, 'Mais'],
  [/Tiros al arco/g, 'Finalizações ao gol'],
  [/Hoy/g, 'Hoje'],
  [/HOY/g, 'HOJE'],
  [/Mañana/g, 'Amanhã'],
  [/MAÑANA/g, 'AMANHÃ'],
  [/Entrada máx\./g, 'Entrada max.'],
  [/selecciones/g, 'seleções'],
  [/Selecciones/g, 'Seleções'],
  [/MISIONES/g, 'TAREFAS'],
  [/misiones/g, 'tarefas'],
  [/gana/g, 'ganhe'],
  [/Gana/g, 'Ganhe'],
  // Inverso das frases compostas / interpoladas
  [/Crear Apuesta/g, 'Criar Aposta'],
  [/CREAR APUESTA/g, 'CRIAR APOSTA'],
  [/Estadísticas/g, 'Estatísticas'],
  [/estadísticas/g, 'estatísticas'],
  [/Faltan/g, 'Faltam'],
  [/elegibles/g, 'elegíveis'],
  [/elegible/g, 'elegível'],
  [/Agrega/g, 'Adicione'],
  [/Agregar/g, 'Adicionar'],
  [/Parlay Turbo/g, 'Múltipla Turbinada'],
  [/Parlay/g, 'Múltipla'],
  [/o Empate/g, 'ou Empate'],
  [/Jugadores de/g, 'Jogadores de'],
  [/por ciento/g, 'por cento'],
  [/Competiciones/g, 'Competições'],
  [/competiciones/g, 'competições'],
  [/Competición/g, 'Competição'],
  [/competición/g, 'competição'],
  [/Ninguna/g, 'Nenhuma'],
  [/Proveedores/g, 'Provedores'],
  [/Bono/g, 'Bônus'],
  [/bono/g, 'bônus'],
  [/Beneficios/g, 'Benefícios'],
  [/beneficios/g, 'benefícios'],
  [/Beneficio/g, 'Benefício'],
  [/Selección/g, 'Seleção'],
  [/selección/g, 'seleção'],
  // Inverso de verbos / navegação
  [/Contraer/g, 'Recolher'],
  [/Volver a/g, 'Voltar para'],
  [/Volver/g, 'Voltar'],
  [/Cerrar/g, 'Fechar'],
  [/Navegación/g, 'Navegação'],
  [/Transmisión/g, 'Transmissão'],
  [/transmisión/g, 'transmissão'],
  [/Pantalla completa/g, 'Tela cheia'],
  [/destacados/g, 'destaques'],
]

const translatableAttributes = ['aria-label', 'alt', 'placeholder', 'title']
const skippedAncestorSelector = [
  'script',
  'style',
  'noscript',
  'svg',
  '[data-brand-localization-skip="true"]',
].join(',')

export const getProductLabelForBrand = (product: ProductMode, brandMode: BrandMode) => (
  productLabelsByBrand[brandMode][product]
)

export const localizeCopy = (value: string, brandMode: BrandMode) => {
  const exactTranslations = brandMode === 'draftea' ? exactDrafteaTranslations : exactPitacoTranslations
  const exactTranslation = exactTranslations[value]
  if (exactTranslation) return exactTranslation

  const replacements = brandMode === 'draftea' ? drafteaReplacements : pitacoReplacements
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
}

const localizeNodeValue = (value: string, brandMode: BrandMode) => {
  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? ''
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? ''
  const text = value.slice(leadingWhitespace.length, value.length - trailingWhitespace.length)
  if (!text) return value

  const localizedText = localizeCopy(text, brandMode)
  return localizedText === text ? value : `${leadingWhitespace}${localizedText}${trailingWhitespace}`
}

const translateAttributes = (root: ParentNode, brandMode: BrandMode) => {
  const elements = root instanceof Element
    ? [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
    : Array.from(root.querySelectorAll<HTMLElement>('*'))

  elements.forEach((element) => {
    if (element.closest(skippedAncestorSelector)) return

    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return

      const localizedValue = localizeCopy(value, brandMode)
      if (localizedValue !== value) {
        element.setAttribute(attribute, localizedValue)
      }
    })
  })
}

const translateTextNodes = (root: Node, brandMode: BrandMode) => {
  const ownerDocument = root.ownerDocument ?? document
  const walker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parentElement = node.parentElement
      if (!parentElement) return NodeFilter.FILTER_REJECT
      if (parentElement.closest(skippedAncestorSelector)) return NodeFilter.FILTER_REJECT
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT

      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((node) => {
    const nodeValue = node.nodeValue
    if (!nodeValue) return

    const localizedValue = localizeNodeValue(nodeValue, brandMode)
    if (localizedValue !== nodeValue) {
      node.nodeValue = localizedValue
    }
  })
}

const applyBrandLocalization = (brandMode: BrandMode) => {
  if (!document.body) return

  translateTextNodes(document.body, brandMode)
  translateAttributes(document.body, brandMode)
}

interface BrandLocalizationEffectProps {
  brandMode: BrandMode
}

export function BrandLocalizationEffect({ brandMode }: BrandLocalizationEffectProps) {
  const isApplyingRef = useRef(false)
  const frameRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.lang = brandMode === 'draftea' ? 'es' : 'pt-BR'
    document.documentElement.dataset.brandMode = brandMode

    const applyLocalization = () => {
      if (isApplyingRef.current) return

      isApplyingRef.current = true
      applyBrandLocalization(brandMode)
      isApplyingRef.current = false
    }

    const clearScheduled = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const runScheduled = () => {
      clearScheduled()
      applyLocalization()
    }

    const scheduleLocalization = () => {
      if (isApplyingRef.current) return
      if (frameRef.current !== null || timerRef.current !== null) return

      // requestAnimationFrame batches translation with paint on visible pages,
      // but it is paused while the document is hidden/backgrounded. The timeout
      // fallback guarantees dynamically-mounted content still gets localized.
      frameRef.current = window.requestAnimationFrame(runScheduled)
      timerRef.current = window.setTimeout(runScheduled, 250)
    }

    applyLocalization()

    const observer = new MutationObserver(scheduleLocalization)
    observer.observe(document.body, {
      attributeFilter: translatableAttributes,
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      clearScheduled()
    }
  }, [brandMode])

  return null
}
