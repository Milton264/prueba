/**
 * Division política de Panamá.
 * Provincias y distritos completos. Corregimientos cargados para las areas de
 * mayor demanda; en el resto el campo funciona como texto libre.
 */
export interface Province {
  name: string;
  districts: { name: string; corregimientos?: string[] }[];
}

export const PANAMA: Province[] = [
  {
    name: 'Panamá',
    districts: [
      {
        name: 'Panamá',
        corregimientos: [
          'Ancon', 'Bella Vista', 'Betania', 'Calidonia', 'Curundu', 'Chilibre',
          'El Chorrillo', 'Juan Diaz', 'Las Cumbres', 'Las Mananitas', 'Pacora',
          'Parque Lefevre', 'Pedregal', 'Pueblo Nuevo', 'Rio Abajo', 'San Felipe',
          'San Francisco', 'San Martin', 'Santa Ana', 'Tocumen', 'Alcalde Diaz',
          '24 de Diciembre', 'Ernesto Cordoba Campos', 'Caimitillo',
        ],
      },
      { name: 'San Miguelito', corregimientos: ['Amelia Denis de Icaza', 'Belisario Frias', 'Belisario Porras', 'Jose Domingo Espinar', 'Mateo Iturralde', 'Victoriano Lorenzo', 'Arnulfo Arias', 'Omar Torrijos', 'Rufina Alfaro'] },
      { name: 'Balboa', corregimientos: ['San Miguel', 'La Ensenada', 'La Esmeralda', 'La Guayra', 'Pedro Gonzalez', 'Saboga', 'Contadora'] },
      { name: 'Chepo', corregimientos: ['Chepo', 'Canita', 'Chepillo', 'El Llano', 'Las Margaritas', 'Santa Cruz de Chinina'] },
      { name: 'Chiman', corregimientos: ['Chiman', 'Brujas', 'Gonzalo Vasquez', 'Pasiga', 'Union Santena'] },
      { name: 'Taboga', corregimientos: ['Taboga', 'Otoque Occidente', 'Otoque Oriente'] },
    ],
  },
  {
    name: 'Panamá Oeste',
    districts: [
      { name: 'Arraijan', corregimientos: ['Arraijan', 'Burunga', 'Cerro Silvestre', 'Juan Demostenes Arosemena', 'Nuevo Emperador', 'Santa Clara', 'Veracruz', 'Vista Alegre'] },
      { name: 'La Chorrera', corregimientos: ['Barrio Balboa', 'Barrio Colón', 'Amador', 'Arosemena', 'El Arado', 'El Coco', 'Feuillet', 'Guadalupe', 'Herrera', 'Hurtado', 'Iturralde', 'La Represa', 'Los Diaz', 'Mendoza', 'Obaldia', 'Playa Leona', 'Puerto Caimito', 'Santa Rita'] },
      { name: 'Capira', corregimientos: ['Capira', 'Caimito', 'Cermeno', 'Cirri de Los Sotos', 'El Cacao', 'La Trinidad', 'Las Ollas Arriba', 'Lidice', 'Villa Carmen', 'Villa Rosario', 'Nueva Arenosa', 'Santa Rosa'] },
      { name: 'Chame', corregimientos: ['Chame', 'Bejuco', 'Buenos Aires', 'Cabuya', 'El Libano', 'Las Lajas', 'Nueva Gorgona', 'Punta Chame', 'Sajalices', 'Sora'] },
      { name: 'San Carlos', corregimientos: ['San Carlos', 'El Espino', 'El Higo', 'Guayabito', 'La Ermita', 'La Laguna', 'Las Uvas', 'Los Llanitos', 'San Jose'] },
      { name: 'La Pintada' },
    ],
  },
  {
    name: 'Colón',
    districts: [
      { name: 'Colón', corregimientos: ['Barrio Norte', 'Barrio Sur', 'Buena Vista', 'Cativa', 'Ciricito', 'Cristobal', 'Escobal', 'Limon', 'Nueva Providencia', 'Puerto Pilon', 'sabanitas', 'San Juan', 'Salamanca', 'Santa Rosa'] },
      { name: 'Chagres', corregimientos: ['Nuevo Chagres', 'Achiote', 'El Guabo', 'La Encantada', 'Palmas Bellas', 'Piña', 'Salud'] },
      { name: 'Donoso', corregimientos: ['Miguel de La Borda', 'Coclesito', 'El Guasimo', 'Gobea', 'Rio Indio', 'San Jose del General'] },
      { name: 'Portobelo', corregimientos: ['Portobelo', 'Cacique', 'Garrote', 'Isla Grande', 'Maria Chiquita', 'Puerto Lindo'] },
      { name: 'Santa Isabel', corregimientos: ['Palenque', 'Cuango', 'Miramar', 'Nombre de Dios', 'Palmira', 'Playa Chiquita', 'Santa Isabel', 'Viento Frio'] },
      { name: 'Omar Torrijos Herrera' },
    ],
  },
  {
    name: 'Chiriquí',
    districts: [
      { name: 'David' }, { name: 'Baru' }, { name: 'Boquete' }, { name: 'Bugaba' },
      { name: 'Alanje' }, { name: 'Boqueron' }, { name: 'Dolega' }, { name: 'Gualaca' },
      { name: 'Remedios' }, { name: 'Renacimiento' }, { name: 'San Felix' },
      { name: 'San Lorenzo' }, { name: 'Tole' }, { name: 'Tierras Altas' },
    ],
  },
  {
    name: 'Coclé',
    districts: [
      { name: 'Penonome' }, { name: 'Aguadulce' }, { name: 'Anton' },
      { name: 'La Pintada' }, { name: 'Nata' }, { name: 'Ola' },
    ],
  },
  {
    name: 'Veraguas',
    districts: [
      { name: 'Santiago' }, { name: 'Atalaya' }, { name: 'Calobre' }, { name: 'Canazas' },
      { name: 'La Mesa' }, { name: 'Las Palmas' }, { name: 'Montijo' }, { name: 'Rio de Jesus' },
      { name: 'San Francisco' }, { name: 'Santa Fe' }, { name: 'Sona' }, { name: 'Mariato' },
    ],
  },
  {
    name: 'Herrera',
    districts: [
      { name: 'Chitre' }, { name: 'Las Minas' }, { name: 'Los Pozos' },
      { name: 'Ocu' }, { name: 'Parita' }, { name: 'Pese' }, { name: 'Santa Maria' },
    ],
  },
  {
    name: 'Los Santos',
    districts: [
      { name: 'Las Tablas' }, { name: 'Guarare' }, { name: 'Los Santos' },
      { name: 'Macaracas' }, { name: 'Pedasi' }, { name: 'Pocri' },
      { name: 'Tonosi' },
    ],
  },
  {
    name: 'Bocas del Toro',
    districts: [
      { name: 'Bocas del Toro' }, { name: 'Changuinola' }, { name: 'Chiriquí Grande' },
      { name: 'Almirante' },
    ],
  },
  {
    name: 'Darién',
    districts: [{ name: 'Chepigana' }, { name: 'Pinogana' }, { name: 'Santa Fe' }],
  },
  { name: 'Comarca Guna Yala', districts: [{ name: 'Guna Yala' }] },
  { name: 'Comarca Ngäbe-Buglé', districts: [{ name: 'Besiko' }, { name: 'Kankintu' }, { name: 'Kusapin' }, { name: 'Mirono' }, { name: 'Muna' }, { name: 'Nole Duima' }, { name: 'Nurum' }, { name: 'Santa Catalina' }] },
  { name: 'Comarca Emberá-Wounaan', districts: [{ name: 'Cemaco' }, { name: 'Sambu' }] },
];

export const PROVINCE_NAMES = PANAMA.map((p) => p.name);

export function getDistricts(province: string): string[] {
  return PANAMA.find((p) => p.name === province)?.districts.map((d) => d.name) ?? [];
}

export function getCorregimientos(province: string, district: string): string[] {
  return (
    PANAMA.find((p) => p.name === province)?.districts.find((d) => d.name === district)
      ?.corregimientos ?? []
  );
}
