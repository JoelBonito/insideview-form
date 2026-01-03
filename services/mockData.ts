import { RealEstateAgency, Visit } from "../types";

export const MOCK_AGENCIES: RealEstateAgency[] = [
  { id: '1', name: 'Re/Max Silver' },
  { id: '2', name: 'Keller Williams' },
  { id: '3', name: 'Century 21' },
  { id: '4', name: 'Imobiliária Independente' },
  { id: '5', name: 'Lar Doce Lar' },
];

export const MOCK_VISITS: Visit[] = [
  {
    id: '1',
    code: 'V-1023',
    date: '2023-10-12',
    realEstateAgency: 'Re/Max Silver',
    address: 'Rua das Flores, 123 - Apt 402, Jardim Botânico',
    photographer: 'Carlos Silva',
    status: 'realizada',
    type: 'fotos',
    value: 150.00,
  },
  {
    id: '2',
    code: 'V-1024',
    date: '2023-10-13',
    realEstateAgency: 'Century 21',
    address: 'Av. Paulista, 900 - Sala 12, Bela Vista',
    photographer: 'Ana Souza',
    status: 'pendente',
    type: 'drone',
    value: 250.00,
  },
  {
    id: '3',
    code: 'V-1025',
    date: '2023-10-14',
    realEstateAgency: 'Imobiliária Independente',
    address: 'Rua Augusta, 500, Consolação',
    status: 'cancelada',
    type: 'fotos',
    value: 120.00,
  },
  {
    id: '4',
    code: 'V-1026',
    date: '2023-10-15',
    realEstateAgency: 'Keller Williams',
    address: 'Av. Brigadeiro Faria Lima, 1200, Pinheiros',
    photographer: 'Marcos Oliveira',
    status: 'realizada',
    type: 'tour_virtual',
    value: 300.00,
  },
  {
    id: '5',
    code: 'V-1027',
    date: '2023-10-15',
    realEstateAgency: 'Re/Max Silver',
    address: 'Rua Oscar Freire, 320, Jardins',
    photographer: 'Julia Mendes',
    status: 'em_andamento',
    type: 'fotos_tour',
    value: 150.00,
  }
];