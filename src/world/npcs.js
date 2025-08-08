export function createNPCs() {
  return [
    { id: 'janusz', name: 'Janusz z IT', x: 8, y: 6, color: '#ffd166', faction:'it', bio:'Pół życia w logach. Druga połowa w kolejce po kawę.', mood:'wry', hair:'#3f3f46', skin:'#f1c27d', shirt:'#2563eb' },
    { id: 'scrum', name: 'Scrum Masterka', x: 20, y: 10, color: '#ef476f', faction:'mgmt', bio:'Timebox to jej religia. Milczy, kiedy trzeba.', mood:'smile', hair:'#8b5cf6', skin:'#f5c6a5', shirt:'#ef476f' },
    { id: 'hr', name: 'HR Ania', x: 46, y: 30, color: '#118ab2', faction:'hr', bio:'Widziała listy, na których są imiona. Nie „FTE”.', mood:'soft', hair:'#d946ef', skin:'#f6d7b0', shirt:'#10b981' },
    { id: 'ceo', name: 'CEO', x: 52, y: 28, color: '#eab308', faction:'mgmt', bio:'Excel mówi mu prawdę. Chciałby, by mówił też sercem.', mood:'stern', hair:'#1f2937', skin:'#e6b98b', shirt:'#f59e0b' },
    { id: 'sec', name: 'Ochrona Marek', x: 12, y: 34, color: '#6366f1', faction:'ops', bio:'Widzi wszystko, ale nie wszystko pamięta.', mood:'neutral', hair:'#111827', skin:'#deb887', shirt:'#4f46e5' },
    { id: 'admin', name: 'Admin Baz', x: 16, y: 8, color: '#22c55e', faction:'it', bio:'Rozmawia z kablami. Odpowiadają szumem wentylatorów.', mood:'stern', hair:'#374151', skin:'#f1c27d', shirt:'#16a34a' },
    { id: 'pm', name: 'Product Manager', x: 50, y: 20, color: '#a78bfa', faction:'mgmt', bio:'Zna różnicę między roadmapą a mapą świata.', mood:'smile', hair:'#0f172a', skin:'#eec39a', shirt:'#a78bfa' },
    { id: 'ux', name: 'UX Ola', x: 30, y: 12, color: '#f472b6', faction:'hr', bio:'Projektuje uważność. Nie zawsze mieści się w pikselach.', mood:'soft', hair:'#ec4899', skin:'#f6d7b0', shirt:'#f472b6' },
    { id: 'qa', name: 'QA Bartek', x: 28, y: 16, color: '#60a5fa', faction:'it', bio:'Rozpoznaje prawdę po kolorze logów.', mood:'wry', hair:'#1e293b', skin:'#f1c27d', shirt:'#60a5fa' },
    { id: 'fin', name: 'Finanse Iwona', x: 40, y: 6, color: '#34d399', faction:'mgmt', bio:'Lubi liczby, które opowiadają historie.', mood:'stern', hair:'#111827', skin:'#eec39a', shirt:'#10b981' },
    { id: 'ops', name: 'DevOps Kamil', x: 22, y: 6, color: '#f59e0b', faction:'it', bio:'Jego zegar odmierza opóźnienia deployów.', mood:'neutral', hair:'#78350f', skin:'#f1c27d', shirt:'#f59e0b' },
    { id: 'sec2', name: 'Bezpieczeństwo Ela', x: 14, y: 18, color: '#06b6d4', faction:'ops', bio:'Procedury pisze dla ludzi, nie dla PDF-ów.', mood:'stern', hair:'#0e7490', skin:'#f6d7b0', shirt:'#06b6d4' },
    // Nowi NPC
    { id: 'mkt1', name: 'Marketing Kasia', x: 72, y: 6, color: '#f472b6', faction:'mgmt', bio:'Sprzeda lód pingwinom, ale słucha ludzi.', mood:'smile', hair:'#be185d', skin:'#f6d7b0', shirt:'#db2777' },
    { id: 'mkt2', name: 'Brand Piotr', x: 76, y: 8, color: '#fb7185', faction:'mgmt', bio:'Kolory ma w małym palcu, budżet w drugim.', mood:'neutral', hair:'#1f2937', skin:'#f1c27d', shirt:'#fb7185' },
    { id: 'law1', name: 'Legal Marta', x: 76, y: 20, color: '#60a5fa', faction:'mgmt', bio:'Umie powiedzieć „nie” tak, że brzmi jak „chronię cię”.', mood:'stern', hair:'#1e3a8a', skin:'#eec39a', shirt:'#3b82f6' },
    { id: 'law2', name: 'Legal Tomek', x: 72, y: 18, color: '#93c5fd', faction:'mgmt', bio:'Śni o krótkich regulaminach.', mood:'wry', hair:'#64748b', skin:'#f1c27d', shirt:'#93c5fd' },
    { id: 'rnd1', name: 'R&D Antek', x: 66, y: 32, color: '#22c55e', faction:'it', bio:'Prototypy kocha bardziej niż produkcję.', mood:'smile', hair:'#16a34a', skin:'#f1c27d', shirt:'#22c55e' },
    { id: 'rnd2', name: 'R&D Sara', x: 74, y: 34, color: '#a3e635', faction:'it', bio:'Zna algorytm na „wow”.', mood:'soft', hair:'#365314', skin:'#f6d7b0', shirt:'#84cc16' },
    { id: 'diz1', name: 'Designer Kuba', x: 30, y: 10, color: '#a78bfa', faction:'hr', bio:'Siatki, marginesy i człowiek w środku.', mood:'smile', hair:'#4c1d95', skin:'#f1c27d', shirt:'#8b5cf6' },
    { id: 'acc1', name: 'Księgowość Basia', x: 42, y: 6, color: '#34d399', faction:'mgmt', bio:'Umie sprawić, że cyferki przestają boleć.', mood:'neutral', hair:'#1f2937', skin:'#f6d7b0', shirt:'#10b981' },
    { id: 'lou1', name: 'Barista Leon', x: 8, y: 44, color: '#f59e0b', faction:'hr', bio:'Espresso jak poezja. Gratis historia.', mood:'smile', hair:'#92400e', skin:'#f1c27d', shirt:'#f59e0b' },
    { id: 'ter1', name: 'Taras Ola', x: 24, y: 46, color: '#06b6d4', faction:'hr', bio:'Uczy oddychać między taskami.', mood:'soft', hair:'#0e7490', skin:'#f6d7b0', shirt:'#06b6d4' },
    { id: 'ops2', name: 'DevOps Nina', x: 64, y: 28, color: '#f59e0b', faction:'it', bio:'Uspokaja alerty głosem.', mood:'neutral', hair:'#9a3412', skin:'#f1c27d', shirt:'#f59e0b' },
    { id: 'sec3', name: 'Ochrona Zbyszek', x: 10, y: 34, color: '#6366f1', faction:'ops', bio:'„Nie da się” to tylko propozycja.', mood:'wry', hair:'#111827', skin:'#deb887', shirt:'#4f46e5' },
    // +30% NPC — każda osoba z krótką historią
    { id: 'ds1', name: 'Data Science Magda', x: 68, y: 32, color: '#22c55e', faction:'it', bio:'Uczy liczby mówić ludzkim głosem. W weekendy uczy jogi.', mood:'soft', hair:'#14532d', skin:'#f6d7b0', shirt:'#22c55e' },
    { id: 'pr1', name: 'Zakupy Marek', x: 66, y: 20, color: '#10b981', faction:'mgmt', bio:'Negocjuje rabaty i godność w jednym zdaniu.', mood:'neutral', hair:'#065f46', skin:'#f1c27d', shirt:'#10b981' },
    { id: 'it2', name: 'Junior Alicja', x: 36, y: 32, color: '#60a5fa', faction:'it', bio:'Pierwszy PR z drżącą ręką. Drugi z dumą.', mood:'smile', hair:'#1e293b', skin:'#f1c27d', shirt:'#3b82f6' },
    { id: 'hr2', name: 'Wellbeing Ewa', x: 19, y: 6, color: '#f472b6', faction:'hr', bio:'Przypomina, że człowiek to nie sprint. Czasem stawia herbatę.', mood:'soft', hair:'#be185d', skin:'#f6d7b0', shirt:'#ec4899' },
    { id: 'fac1', name: 'Utrzymanie Marek', x: 6, y: 44, color: '#94a3b8', faction:'ops', bio:'Naprawia żarówki i nastroje. Zna wszystkie skrytki.', mood:'wry', hair:'#0f172a', skin:'#deb887', shirt:'#94a3b8' },
    { id: 'mkt3', name: 'Copy Gosia', x: 70, y: 6, color: '#fda4af', faction:'mgmt', bio:'Pisze slogany, które pamiętasz w poniedziałek.', mood:'smile', hair:'#9f1239', skin:'#f6d7b0', shirt:'#fda4af' },
    { id: 'rnd3', name: 'Research Oli', x: 64, y: 30, color: '#84cc16', faction:'it', bio:'Znajduje odpowiedzi na pytania, których jeszcze nie zadałeś.', mood:'neutral', hair:'#3f6212', skin:'#f1c27d', shirt:'#84cc16' },
    { id: 'vip1', name: 'Asystent CFO', x: 50, y: 4, color: '#a5b4fc', faction:'mgmt', bio:'Szepcze liczby do ucha szefów. Po godzinach słucha jazzu.', mood:'stern', hair:'#3730a3', skin:'#eec39a', shirt:'#818cf8' },
  ];
}


