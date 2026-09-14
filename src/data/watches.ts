export type Watch = {
  id: string; marca: string; nome: string; estilo: string;
  especificacoes: string; preco: number | { min: number; max: number };
  loja: string; url?: string; imagem?: string;
};

// Adicione novos modelos ao final com um id único. Mantenha os ids existentes.
// Fotos: coloque o arquivo em public/watches e use imagem: '/watches/modelo.jpg'.
// Preço: 125 exibe ≈ R$ 125; { min: 100, max: 150 } exibe R$ 100–R$ 150.
export const watches: Watch[] = [
  { id: '1', marca: 'Tandorio', nome: 'Piloto Automático 36mm (NH35)', estilo: 'Field/Piloto', especificacoes: 'Cristal de Safira, 200m (20ATM), Movimento Automático Seiko NH35, Aço Inox.', preco: 325, loja: 'AliExpress' },
  { id: '2', marca: 'Addiesdive', nome: 'AD2554 (Field 36mm)', estilo: 'Field/Retrô', especificacoes: 'Cristal de Safira, 100m, Quartzo Miyota 2035, Aço Inox.', preco: 252, loja: 'AliExpress' },
  { id: '3', marca: 'Addiesdive', nome: 'AD2536 Automático', estilo: 'Diver Clássico', especificacoes: 'Cristal de Safira, Catraca de Cerâmica, 200m, Automático Miyota 8215.', preco: 592, loja: 'AliExpress' },
  { id: '4', marca: 'Addiesdive', nome: 'MY-H3-2QZ', estilo: 'Diver', especificacoes: 'Vidro Hardlex, Catraca de Cerâmica, 200m, Quartzo com data.', preco: 208, loja: 'AliExpress' },
  { id: '5', marca: 'Addiesdive', nome: 'MY-H3-C Silvery', estilo: 'Diver Esportivo', especificacoes: 'Aço inoxidável 316L, vidro Hardlex convexo, 200m, quartzo Miyota 2115, lume BGW9.', preco: 201, loja: 'AliExpress', url: 'https://pt.aliexpress.com/item/1005010402858636.html?skuId=12000056408959778', imagem: '/watches/addiesdive-my-h3-c.jpg' },
  { id: '6', marca: 'Casio', nome: 'AE-1200WHB-1BVDF', estilo: 'Digital Utilitário', especificacoes: 'Pulseira de Nylon, 100m, Bateria de 10 anos, Cronômetro, Alarmes.', preco: 242, loja: 'Mercado Livre' },
  { id: '7', marca: 'Technos', nome: 'Steel Prata (2115NCY/1A)', estilo: 'Analógico Social', especificacoes: 'Todo em Aço Inox, 50m, Cristal Mineral, Quartzo.', preco: 272, loja: 'Mercado Livre' },
  { id: '8', marca: 'Casio', nome: 'Vintage A159WA-N1DF', estilo: 'Digital Retrô', especificacoes: 'Caixa de Resina, Pulseira em Aço, 30m, Cronômetro.', preco: 85, loja: 'Mercado Livre' },
  { id: '9', marca: 'Sea-Gull', nome: "Air Force Pilot's 1963", estilo: 'Piloto / Retrô', especificacoes: 'Anunciado com Hardlex, 3 bar e pulseira de couro. Movimento a confirmar: título indica quartzo, ficha menciona corda manual.', preco: 291, loja: 'AliExpress' },
  { id: '10', marca: 'Tandorio', nome: 'Piloto Retrô 39mm (VH31)', estilo: 'Field/Piloto', especificacoes: 'Quartzo japonês VH31 com segundos de varredura, safira, aço inoxidável 316L, 200m (20ATM), coroa rosqueada e pulseira de couro de 20mm.', preco: 257, loja: 'AliExpress', url: 'https://pt.aliexpress.com/item/1005012362640352.html', imagem: '/watches/tandorio-vh31-39mm.jpg' },
  { id: '11', marca: 'Casio', nome: 'W-59-1VQ Resina', estilo: 'Digital Esportivo', especificacoes: 'Caixa e pulseira em resina, 50m (5 ATM) à prova d\'água, cronômetro 1/100s, alarme diário, luz LED laranja, bateria 7 anos.', preco: 108, loja: 'Mercado Livre', url: 'https://www.mercadolivre.com.br/relogio-casio-masculino-digital-preto-de-resina-w-59-1vq/p/MLB21693452', imagem: '/watches/casio-w59-1vq.png' },
  { id: '12', marca: 'Casio', nome: 'Vintage A138 Retrô Aço Inox', estilo: 'Analógico Retrô', especificacoes: 'Edição Limitada, mostrador quadrado retrô, caixa em metal cromado, pulseira em aço inoxidável, calendário com data, 30m.', preco: 128, loja: 'Mercado Livre', url: 'https://www.mercadolivre.com.br/relogio-casio-vintage-a138-retro-aco-inox-edicao-limitada-prateado-preto/p/MLB69950796', imagem: '/watches/casio-vintage-a138.png' },
  { id: '13', marca: 'Casio', nome: 'Vintage A158WA-1DF Prata', estilo: 'Digital Retrô', especificacoes: 'Pulseira em aço inoxidável com fecho ajustável, caixa em resina cromada, cronômetro de 1/100s, alarme diário, luz LED verde, 30m.', preco: 184, loja: 'Mercado Livre', url: 'https://www.mercadolivre.com.br/relogio-unissex-casio-digital-esportivo-a158wa-1df-prata-retro-vintage-pulseira-em-aco-inoxidavel/p/MLB32162099', imagem: '/watches/casio-vintage-a158wa-1df.png' },
  { id: '14', marca: 'Casio', nome: 'Classic F-91W Original', estilo: 'Digital Vintage', especificacoes: 'O clássico mundial da Casio. Caixa e pulseira em resina leve, cronômetro de 1/100s, alarme diário, micro-luz LED, bateria de 7 anos.', preco: 184, loja: 'Mercado Livre', imagem: '/watches/casio-f91w.png' },
  { id: '15', marca: 'Casio', nome: 'Vintage A159WGEA Dourado', estilo: 'Digital Retrô', especificacoes: 'Acabamento dourado com pulseira em aço inoxidável, alarme diário, cronômetro de precisão, calendário automático, luz noturna.', preco: 229, loja: 'Mercado Livre', imagem: '/watches/casio-vintage-dourado.png' },
  { id: '16', marca: 'Citizen', nome: 'OF Collection Elegant (AW1750-85A)', estilo: 'Eco-Drive Social', especificacoes: 'Tecnologia Eco-Drive (alimentação solar J810), reserva de 8 meses, caixa de 41,2mm em aço inox, WR 100m (10 bar), vidro mineral, mostrador branco texturizado, calendário com data.', preco: 1045, loja: 'Citizen Oficial', url: 'https://www.citizenwatch.es/coleccion/of-collection/elegant/aw1750-85a/', imagem: '/watches/citizen-of-elegant-aw1750.png' },
];

