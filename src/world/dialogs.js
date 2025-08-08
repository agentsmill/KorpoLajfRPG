export const DIALOG_TREES = {
  janusz: {
    nodes: {
      // IT ARC: Deploy + Serwerownia + Legacy-Monolit
      start: { speaker: 'Janusz', text: 'No i co, młody? Tu się logi czyta, a nie slajdy.', next: 'fork' },
      fork: {
        title: 'Janusz – ścieżka', text: 'Czego chcesz się nauczyć?',
        choices: [
          { id: 'truth', label: 'Prawda w logach', effects: { rep: { it: 15 }, objective: { id:'gather_logs', label: 'Zbierz logi', x: 18, y: 8 } }, next: 'truth1' },
          { id: 'deploy', label: 'Sztuka deployu', effects: { rep: { it: 10 }, stress: 5, addObjective:{ id:'deploy_watch', label:'Obserwuj deploy', x: 22, y: 9 } }, next: 'deploy1' },
          { id: 'gate', label: 'Dostęp do serwerowni', requires: { it: 30 }, next: 'gate1' },
        ]
      },
      // Truth branch
      truth1: { speaker: 'Janusz', text: 'Log nie kłamie. Ludzie – czasem tak.', next: 'truth2' },
      truth2: { speaker: 'Janusz', text: 'Masz oko do wzorców? Sprawdźmy.', check:{ skill:'Logika', dc:12, success:'truth_win', failure:'truth_fail' } },
      truth_win: { speaker: 'Janusz', text: 'Łapiesz. Prawda lubi cierpliwych.', effects:{ rep:{ it:8 }, completeObjective:{id:'gather_logs'} }, next:'truth_branch' },
      truth_fail: { speaker: 'Janusz', text: 'Spoko. Nauczysz się. Prawda nie ucieknie.', effects:{ stress:4 }, next:'truth_branch' },
      truth_branch: {
        title: 'Wątki', text: 'Co dalej?',
        choices: [
          { id:'trace', label:'Śledzić ścieżkę requestów', next:'trace1' },
          { id:'metrics', label:'Zbadać skoki metryk', next:'metrics1' },
          { id:'interview', label:'Pogadać z QA', effects:{ addObjective:{ id:'meet_qa', label:'Porozmawiaj z QA Bartkiem', x: 28, y: 16 } }, next:'end' },
          { id:'legend', label:'Stary commit – legenda', requires:{ it:10 }, next:'legend1' },
        ]
      },
      legend1: { speaker:'Janusz', text:'Kiedyś commit zmienił bieg sprintu. Autor już tu nie pracuje.', next:'legend2' },
      legend2: { speaker:'Janusz', text:'Zrozumiesz go tylko łącząc logikę z uporem.', check:{ skill:'Logika', dc:13, success:'legend3', failure:'legend_fail' } },
      legend3: { speaker:'Janusz', text:'Widzisz wzór? Teraz wytrzymaj ciężar refactoru.', check:{ skill:'Grit', dc:12, success:'legend_ok', failure:'legend_fail2' } },
      legend_ok: { speaker:'Janusz', text:'Masz to. To nie „legacy”. To historia człowieka.', effects:{ setFlag:{ it_legend:true, case_it:true }, addObjective:{ id:'board_it_story', label:'Dowód: commit-legenda (na zarząd)', x: 48, y: 30 } }, next:'end' },
      legend_fail: { speaker:'Janusz', text:'Jeszcze nie dziś. Logika też odpoczywa.', effects:{ stress:4 }, next:'end' },
      legend_fail2: { speaker:'Janusz', text:'Refactor boli. Wrócisz mocniejszy.', effects:{ stress:5 }, next:'end' },
      trace1: { speaker:'Janusz', text:'Tu widać timeouty jak memy o piątku.', check:{ skill:'Logika', dc:13, success:'trace2', failure:'trace_fail' } },
      trace2: { speaker:'Janusz', text:'To idzie do proxy. Kto grzebał w konfiguracji?', next:'trace3' },
      trace3: { speaker:'Janusz', text:'Masz dwie drogi: szybka łata czy rozmowa z DevOpsem?', next:'trace_choice' },
      trace_choice: { title:'Wybór', text:'Jak gramy?', choices:[
        { id:'patch', label:'Szybka łata (Grit)', check:{ skill:'Grit', dc:14, success:'patch_ok', failure:'patch_bad' } },
        { id:'talk_ops', label:'Rozmowa z DevOpsem', effects:{ addObjective:{ id:'meet_ops', label:'Znajdź Kamila z DevOps', x:22, y:6 } }, next:'end' },
      ]},
      patch_ok: { speaker:'Janusz', text:'Zrobiłeś hotfixa i nadal żyjesz. Szacun.', effects:{ rep:{ it:10 }, stress:-4 }, next:'end' },
      patch_bad: { speaker:'Janusz', text:'Rollback. I jeszcze kawa dla QA na zgodę.', effects:{ stress:8 }, next:'end' },
      trace_fail: { speaker:'Janusz', text:'Logika nie zawsze pierwsza. Spróbuj metryki.', next:'metrics1' },
      metrics1: { speaker:'Janusz', text:'Skok CPU o 9:05. Co się dzieje o 9:05…?', next:'metrics2' },
      metrics2: { speaker:'Janusz', text:'Daily. I generacja raportów. Dwie ciężkie rzeczy naraz.', next:'metrics_choice' },
      metrics_choice: { title:'Wybór', text:'Co odetniemy?', choices:[
        { id:'reports', label:'Raporty tymczasowo na później', effects:{ rep:{ mgmt:5 }, stress:-3 }, next:'metrics_end' },
        { id:'throttle', label:'Ogranicz sesje daily (Retoryka check u PM)', check:{ skill:'Retoryka', dc:12, success:'metrics_pm_ok', failure:'metrics_pm_bad' } },
      ]},
      metrics_pm_ok: { speaker:'Janusz', text:'PM kupił argument. Dobra robota.', effects:{ rep:{ mgmt:5 } }, next:'metrics_end' },
      metrics_pm_bad: { speaker:'Janusz', text:'Usłyszał „to nie w duchu agile”. Trudno.', effects:{ stress:4 }, next:'metrics_end' },
      metrics_end: { speaker:'Janusz', text:'Do serwerowni i tak pójdziesz. Tam jest serce.', next:'gate_hint' },
      gate_hint: { speaker:'Janusz', text:'Klucz do serwerowni nie dla każdego. Reputacja IT 30.', next:'end' },
      // Deploy branch
      deploy1: { speaker: 'Janusz', text: 'Jak się nie pali, to znaczy, że się nie wdraża.', next: 'deploy2' },
      deploy2: { speaker:'Janusz', text:'Obserwuj logi i nie ufaj zielonym słupkom.', next:'deploy3' },
      deploy3: { speaker:'Janusz', text:'Masz do wyboru: auto-rollback czy ręczna interwencja.', next:'deploy_choice' },
      deploy_choice: { title:'Deploy', text:'Twoja strategia?', choices:[
        { id:'auto', label:'Auto-rollback z progiem', check:{ skill:'Logika', dc:12, success:'auto_ok', failure:'auto_bad' } },
        { id:'manual', label:'Ręczna interwencja (Grit)', check:{ skill:'Grit', dc:13, success:'manual_ok', failure:'manual_bad' } },
      ]},
      auto_ok: { speaker:'Janusz', text:'Zadziałało. Nie musisz być bohaterem codziennie.', effects:{ rep:{ it:6 }, stress:-2 }, next:'end' },
      auto_bad: { speaker:'Janusz', text:'Próg ustawiony źle. Ludziom świeci czerwone.', effects:{ stress:8 }, next:'end' },
      manual_ok: { speaker:'Janusz', text:'Wszedłeś w ogień i nie spłonąłeś.', effects:{ rep:{ it:8 }, stress:6 }, next:'end' },
      manual_bad: { speaker:'Janusz', text:'Dłoń ci drży. To normalne.', effects:{ stress:10 }, next:'end' },
      // Gate to server room
      gate1: { speaker: 'Janusz', text: 'Masz repkę, masz klucz. Ale wiedz, że to droga bez powrotu.', effects:{ unlockFaction:'admin', setFlag:{ admin_unlocked:true }, objective:{ id:'enter_srv', label:'Wejdź do serwerowni', x:42, y:28 } }, next: 'end' },
      end: { speaker: 'Janusz', text: 'Wracaj, jak będziesz gotów na „legacy-monolita”.' }
    }
  },
  admin: {
    nodes: {
      start: { speaker: 'Admin Baz', text: 'Tu się nie mówi głośno. Tu się robi.', requiresFlags:{ admin_unlocked:true }, next:'srv_fork' },
      srv_fork: { title:'Serwerownia', text:'Od czego zaczynamy?', choices:[
        { id:'power', label:'Zasilanie i redundancja', next:'p1' },
        { id:'net', label:'Sieć i zapętlenia', next:'n1' },
        { id:'backup', label:'Backup — kto, co, gdzie', next:'b1' },
        { id:'memoir', label:'Czarna noc – blackout', next:'ad_bs1' },
      ]},
      p1: { speaker:'Admin Baz', text:'UPS-y śpią, póki nie krzyczysz.', next:'p2' },
      p2: { speaker:'Admin Baz', text:'Masz generator testów. Włączasz?', next:'p_choice' },
      p_choice: { title:'Test', text:'Ryzykujemy?', choices:[
        { id:'yes', label:'Tak (Grit)', check:{ skill:'Grit', dc:14, success:'p_ok', failure:'p_fail' } },
        { id:'no', label:'Nie. Najpierw logi.', next:'p_logs' },
      ]},
      p_ok: { speaker:'Admin Baz', text:'Masz nerwy. UPS-y mówią „jest git”.', effects:{ rep:{ it:6 } }, next:'srv_fork' },
      p_fail:{ speaker:'Admin Baz', text:'Zrobiło „bzzzt”. Notatka do CFO.', effects:{ rep:{ mgmt:-4 }, stress:6 }, next:'srv_fork' },
      p_logs:{ speaker:'Admin Baz', text:'Słusznie. Logi, potem czyny.', effects:{ rep:{ it:4 } }, next:'srv_fork' },
      n1: { speaker:'Admin Baz', text:'Pętla w VLAN-ach. Ktoś kocha spaghetti.', next:'n2' },
      n2: { speaker:'Admin Baz', text:'Zbijemy broadcast, ale kogo to zaboli?', next:'n_choice' },
      n_choice: { title:'Sieć', text:'Decyzja?', choices:[
        { id:'hr_wifi', label:'Przyciąć Wi‑Fi HR (Retoryka u HR)', check:{ skill:'Retoryka', dc:12, success:'n_hr_ok', failure:'n_hr_bad' } },
        { id:'lab', label:'Odciąć lab testowy (QA)', effects:{ rep:{ it:-2, hr:2 } }, next:'srv_fork' },
      ]},
      n_hr_ok:{ speaker:'Admin Baz', text:'Przekonałeś ich do kabelka.', effects:{ rep:{ hr:4 } }, next:'srv_fork' },
      n_hr_bad:{ speaker:'Admin Baz', text:'„To dyskryminacja!” – cytuję.', effects:{ stress:4 }, next:'srv_fork' },
      b1: { speaker:'Admin Baz', text:'Backup jest do odtwarzania, nie do robienia.', next:'b2' },
      b2: { speaker:'Admin Baz', text:'Test restore teraz?', next:'b_choice' },
      b_choice: { title:'Backup', text:'Robimy drill?', choices:[
        { id:'now', label:'Teraz (Logika)', check:{ skill:'Logika', dc:13, success:'b_ok', failure:'b_fail' } },
        { id:'night', label:'W nocy, po cichu', next:'b_night' },
      ]},
      b_ok: { speaker:'Admin Baz', text:'Działa. Najlepsza wiadomość dnia.', effects:{ rep:{ it:8 } }, next:'srv_fork' },
      b_fail:{ speaker:'Admin Baz', text:'Nie ten katalog. Uczymy się.', effects:{ stress:8 }, next:'srv_fork' },
      b_night:{ speaker:'Admin Baz', text:'Mądrze. Ludzie też chcą żyć.', next:'srv_fork' },
      ad_bs1:{ speaker:'Admin Baz', text:'Była kiedyś noc. Zgasło wszystko oprócz nerwów.', next:'ad_bs2' },
      ad_bs2:{ speaker:'Admin Baz', text:'Od tamtej pory mam szacunek do ryzyka.', effects:{ setFlag:{ admin_blackout:true, case_ops_risk:true }, addObjective:{ id:'board_admin_story', label:'Dowód: blackout (na zarząd)', x:48, y:30 } }, next:'srv_fork' },
      legacy_intro: { speaker:'Admin Baz', text:'Chcesz do monolitu? Tam są duchy commitów.', requires:{ it:25 }, next:'legacy_gate' },
      legacy_gate: { speaker:'Admin Baz', text:'Potrzebujesz jeszcze zgody DevOps i QA.', effects:{ addObjective:{ id:'ok_ops', label:'Zdobądź zgodę DevOps', x:22, y:6 } }, next:'legacy_qa' },
      legacy_qa: { speaker:'Admin Baz', text:'I QA. Oni pamiętają każdy błąd.', effects:{ addObjective:{ id:'ok_qa', label:'Zdobądź zgodę QA', x:28, y:16 } }, next:'srv_fork' },
      legacy_ready: { speaker:'Admin Baz', text:'Masz zgody? No to wchodzimy.', requiresFlags:{ ok_ops:true, ok_qa:true }, next:'legacy1' },
      legacy1: { speaker:'Admin Baz', text:'Tu żyją Feature Flagi sprzed epok.', next:'legacy2' },
      legacy2: { speaker:'Admin Baz', text:'Jeden refactor za daleko i runie.', next:'legacy_choice' },
      legacy_choice: { title:'Monolit', text:'Plan?', choices:[
        { id:'strang', label:'Strangler pattern – na raty', effects:{ rep:{ it:10 } }, next:'legacy_str1' },
        { id:'surgery', label:'Chirurgia jednego modułu (Grit)', check:{ skill:'Grit', dc:15, success:'legacy_s_ok', failure:'legacy_s_bad' } },
      ]},
      legacy_str1: { speaker:'Admin Baz', text:'Powoli i bez bohaterstwa. Mądrze.', next:'srv_fork' },
      legacy_s_ok: { speaker:'Admin Baz', text:'Przeżyłeś. Monolit też. Na razie.', effects:{ rep:{ it:12 }, stress:6 }, next:'srv_fork' },
      legacy_s_bad:{ speaker:'Admin Baz', text:'Pager o 3:00. Bywa.', effects:{ stress:12 }, next:'srv_fork' },
    }
  },
  ux: {
    nodes: {
      start: { speaker: 'UX Ola', text: 'Czy ten interfejs sprawia, że chcesz uciec? Bądź szczery.', next: 'fork' },
      fork: {
        title: 'UX – ścieżka', text: 'Co poprawiamy?',
        choices: [
          { id: 'copy', label: 'Teksty – mniej korpo, więcej człowieka', effects: { rep: { hr: 5 } }, next: 'copy1' },
          { id: 'flow', label: 'Przepływ – mniej klików, mniej łez', effects: { rep: { mgmt: 5 } }, next: 'flow1' },
          { id: 'backstory', label: 'Historia użytkownika (a11y)', requires:{ hr:8 }, next:'ux_bs1' },
        ]
      },
      copy1: { speaker: 'UX Ola', text: '„Zasoby ludzkie” -> „Ludzie”. Niby nic, a robi różnicę.', next: 'end' },
      flow1: { speaker: 'UX Ola', text: 'Każdy zbędny klik to cichy krzyk w open space.', effects:{ giveItem:'Makieta – tryb Zen' }, next: 'end' },
      ux_bs1: { speaker:'UX Ola', text:'Kiedyś przyszła pani, która nie widziała dobrze kontrastu.', next:'ux_bs2' },
      ux_bs2: { speaker:'UX Ola', text:'Dodałam kontrast, ale ważniejsze – dodałam uważność.', check:{ skill:'Empatia', dc:12, success:'ux_bs_ok', failure:'ux_bs_fail' } },
      ux_bs_ok: { speaker:'UX Ola', text:'Weź tę historię na zarząd. To jest twoja „liczba”.', effects:{ setFlag:{ ux_access:true, case_hr:true }, addObjective:{ id:'board_ux_story', label:'Dowód: a11y historia (na zarząd)', x:48, y:30 } }, next:'end' },
      ux_bs_fail: { speaker:'UX Ola', text:'To nie jest tylko interfejs. To czyjś dzień.', effects:{ stress:3 }, next:'end' },
      end: { speaker: 'UX Ola', text: 'Wróć z feedbackiem. Tylko prawdziwym.' }
    }
  },
  qa: {
    nodes: {
      start: { speaker: 'QA Bartek', text: 'Jeśli działa u Ciebie, to jeszcze nic nie znaczy.', next: 'fork' },
      fork: { title: 'QA – ścieżka', text: 'Strategia testów?', choices: [
        { id: 'auto', label: 'Automatyzacja i coverage', effects: { rep: { it: 6 } }, next: 'a1' },
        { id: 'exp', label: 'Eksploracyjne – znajdź to, czego nie szukasz', effects: { rep: { it: 6 } }, next: 'e1' },
        { id: 'ok_qa', label: 'Poproś o zgodę na monolit', effects:{ setFlag:{ ok_qa:true } }, next:'okqa1' },
        { id:'backstory', label:'Złoty bug', requires:{ it:8 }, next:'qa_bs1' },
      ]},
      a1: { speaker: 'QA Bartek', text: 'Testy nie są po to, by przejść. Są po to, by znaleźć prawdę.', next: 'end' },
      e1: { speaker: 'QA Bartek', text: 'Najlepsze bugi mówią szeptem.', effects:{ giveItem:'Lista edge-case' }, next: 'end' },
      okqa1:{ speaker:'QA Bartek', text:'Zgoda warunkowa. Pokaż plan i testy powrotu.', effects:{ addObjective:{ id:'ok_qa_plan', label:'Przygotuj plan testów powrotu', x:18, y:8 } }, next:'end' },
      qa_bs1:{ speaker:'QA Bartek', text:'Raz znalazłem buga, który uratował klienta przed kompromitacją.', next:'qa_bs2' },
      qa_bs2:{ speaker:'QA Bartek', text:'Nie chodziło o testy. Chodziło o ciekawość.', check:{ skill:'Logika', dc:12, success:'qa_bs_ok', failure:'qa_bs_fail' } },
      qa_bs_ok:{ speaker:'QA Bartek', text:'Weź ten „Złoty bug” jako case study.', effects:{ setFlag:{ qa_gold:true, case_it:true }, addObjective:{ id:'board_qa_case', label:'Dowód: Złoty bug (na zarząd)', x:48, y:30 } }, next:'end' },
      qa_bs_fail:{ speaker:'QA Bartek', text:'Bez ciekawości testy są ślepe.', effects:{ stress:3 }, next:'end' },
      end: { speaker: 'QA Bartek', text: 'Wracam do raportu. Nie bój się czerwonego.' }
    }
  },
  fin: {
    nodes: {
      start: { speaker: 'Finanse Iwona', text: 'Excel płacze, ale jakoś musi się spiąć.', next: 'fork' },
      fork: { title: 'Finanse – ścieżka', text: 'Co tniesz?', choices: [
        { id: 'cloud', label: 'Chmura z 80 do 60% (odetchnie CFO)', effects: { rep: { mgmt: 8 } }, next: 'f1' },
        { id: 'snacks', label: 'Przekąski – zdrada, ale tania', effects: { rep: { hr: -4 } }, next: 'f2' },
        { id: 'backstory', label: 'Liczby, które mówią', requires:{ mgmt:8 }, next:'fin_bs1' },
      ]},
      f1: { speaker: 'Finanse Iwona', text: 'Zespół odczuje. Zawsze ktoś odczuje.', next: 'end' },
      f2: { speaker: 'Finanse Iwona', text: 'Nie rób tego ludziom. Chyba że…', next: 'end' },
      fin_bs1:{ speaker:'Finanse Iwona', text:'Mój ojciec miał mały sklep. Excel nie przewidział łez.', next:'fin_bs2' },
      fin_bs2:{ speaker:'Finanse Iwona', text:'Dlatego robię metryki, które widzą ludzi.', check:{ skill:'Retoryka', dc:12, success:'fin_bs_ok', failure:'fin_bs_fail' } },
      fin_bs_ok:{ speaker:'Finanse Iwona', text:'Weź „metrykę tęsknoty” na zarząd.', effects:{ setFlag:{ fin_story:true, case_hr:true }, addObjective:{ id:'board_fin_metric', label:'Dowód: Metryka tęsknoty (na zarząd)', x:48, y:30 } }, next:'end' },
      fin_bs_fail:{ speaker:'Finanse Iwona', text:'Słowa są ważne. Nauczysz się ich używać.', effects:{ stress:3 }, next:'end' },
      end: { speaker: 'Finanse Iwona', text: 'Za każdą liczbą jest czyjś dzień.' }
    }
  },
  ops: {
    nodes: {
      start: { speaker: 'DevOps Kamil', text: 'Pipelines są jak poezja. Czasem wolna.', next: 'fork' },
      fork: { title: 'DevOps – ścieżka', text: 'Kierunek?', choices: [
        { id: 'infra', label: 'Infrastruktura jako kod', effects: { rep: { it: 8 } }, next: 'o1' },
        { id: 'obs', label: 'Obserwowalność – mniej zaskoczeń', effects: { rep: { it: 8 } }, next: 'o2' },
        { id:'ok_ops', label:'Zgoda na monolit', effects:{ setFlag:{ ok_ops:true } }, next:'okops1' },
        { id:'backstory', label:'Pager o 3:00', requires:{ it:8 }, next:'ops_bs1' },
      ]},
      o1: { speaker: 'DevOps Kamil', text: 'Kod pamięta lepiej niż człowiek.', next: 'end' },
      o2: { speaker: 'DevOps Kamil', text: 'Alert, który nie budzi – to dobry alert.', next: 'end' },
      okops1:{ speaker:'DevOps Kamil', text:'Zgoda warunkowa. Monitoring na maksa i rollbacks gotowe.', next:'end' },
      ops_bs1:{ speaker:'DevOps Kamil', text:'Pager budził mnie tygodniami. Zrozumiałem SLO nie ze slajdu, tylko z życia.', next:'ops_bs2' },
      ops_bs2:{ speaker:'DevOps Kamil', text:'Weź to jako argument „ryzyko operacyjne” na zarząd.', effects:{ setFlag:{ ops_slo:true, case_ops_risk:true }, addObjective:{ id:'board_ops_risk', label:'Dowód: ryzyko operacyjne (na zarząd)', x:48, y:30 } }, next:'end' },
      end: { speaker: 'DevOps Kamil', text: 'Wracam do YAML-i.' }
    }
  },
  sec: {
    nodes: {
      start: { speaker: 'Ochrona Marek', text: 'Z identyfikatorem wejdziesz wszędzie. Bez – nigdzie.', next: 'fork' },
      fork: { title:'Recepcja', text:'', choices:[
        { id:'base', label:'Standard', next:'end' },
        { id:'backstory', label:'Widok z recepcji', next:'guard_bs1' },
      ]},
      guard_bs1:{ speaker:'Ochrona Marek', text:'Widziałem więcej rozstań niż HR. Ludzie płaczą tu, nie w Excelu.', effects:{ setFlag:{ guard_truth:true } }, next:'end' },
      end: { speaker: 'Ochrona Marek', text: 'Nie giniesz – ja mam mniej papierologii.' }
    }
  },
  sec2: {
    nodes: {
      start: { speaker: 'Bezpieczeństwo Ela', text: 'Polityka to nie jest „kliknij OK”.', next: 'fork' },
      fork: { title: 'Bezpieczeństwo – ścieżka', text: 'Dylemat?', choices: [
        { id: 'rodo', label: 'RODO kontra realne życie', effects: { rep: { hr: 6 } }, next: 's1' },
        { id: 'passwd', label: 'Hasła zmieniajmy z sensem', effects: { rep: { it: 4 } }, next: 's2' },
        { id: 'backstory', label: 'Phish i przebudzenie', next: 'sec_bs1' },
      ]},
      s1: { speaker: 'Bezpieczeństwo Ela', text: 'Zasady mają sens, jeśli chronią człowieka.', next: 'end' },
      s2: { speaker: 'Bezpieczeństwo Ela', text: 'Dobre praktyki są dobre, gdy są praktyczne.', next: 'end' },
      sec_bs1:{ speaker:'Bezpieczeństwo Ela', text:'Kiedyś i ja kliknęłam w „pączki”. Wstyd? Raczej nauka.', next:'sec_bs2' },
      sec_bs2:{ speaker:'Bezpieczeństwo Ela', text:'Weź moją historię, jeśli chcesz mówić o błędach bez wstydu.', effects:{ setFlag:{ sec_redeem:true } }, next:'end' },
      end: { speaker: 'Bezpieczeństwo Ela', text: 'Dbaj o ludzi, nie tylko o checkboxy.' }
    }
  },
  hr: {
    nodes: {
      start: { speaker: 'HR Ania', text: 'Tu chronimy ludzi, nie tylko dane.', next: 'fork' },
      fork: {
        title: 'HR – ścieżka', text: 'Czego potrzebujesz?',
        choices: [
          { id: 'empathy', label: 'Empatia', effects: { rep: { hr: 15 }, stress: -5 }, next: 'e1' },
          { id: 'policy', label: 'Reguły są po coś', effects: { rep: { hr: 10 } }, next: 'p1' },
          { id: 'save', label: 'Lista do zwolnień – ingerować?', requires: { hr: 20 }, requiresStress:{ max: 70 }, next: 's2' },
          { id: 'board_inv', label: 'Przygotować na zarząd (Retoryka)', requiresStress:{ max: 85 }, check:{ skill:'Retoryka', dc:12, success:'bprep_ok', failure:'bprep_bad' } },
          { id: 'backstory', label: 'Moja historia', requires:{ hr:10 }, next:'hr_bs1' },
        ]
      },
      e1: { speaker: 'HR Ania', text: 'Pracownik to nie „resource”.', next: 'e2' },
      e2: { speaker: 'HR Ania', text: 'Chcesz posłuchać historii czy liczb?', next: 'e_choice' },
      e_choice: { title:'Empatia', text:'Co zrobisz?', choices:[
        { id:'talk1', label:'Rozmowa z osobą z listy', effects:{ rep:{ hr:6 }, setFlag:{ hr_spoke:true } }, next:'end' },
        { id:'workshop', label:'Warsztat o wypaleniu', effects:{ rep:{ hr:4 }, stress:-4 }, next:'end' },
      ]},
      p1: { speaker: 'HR Ania', text: 'Procedura to parasol, nie kajdanki.', next: 'p2' },
      p2: { speaker: 'HR Ania', text: 'Wyjątki istnieją, ale muszą mieć sens.', next: 'end' },
      s2: { speaker: 'HR Ania', text: 'Dobrze. Kogo bronimy? Liczą się argumenty.', next: 's3' },
      s3: { speaker: 'HR Ania', text: 'Empatia pomoże. Spróbujesz?', check:{ skill:'Empatia', dc:13, success:'s_ok', failure:'s_bad' } },
      s_ok: { speaker:'HR Ania', text:'Przekonałeś komisję – na razie.', effects:{ rep:{ hr:10 }, setFlag:{ saved_one:true } }, next:'end' },
      s_bad:{ speaker:'HR Ania', text:'Nie dziś. Ale nie przestawaj próbować.', effects:{ stress:6 }, next:'end' },
      bprep_ok:{ speaker:'HR Ania', text:'Twoje słowa mogą coś zmienić. Dam Ci wejściówkę.', effects:{ setFlag:{ board_invite:true }, rep:{ mgmt:6 }, objective:{ id:'board_meet', label:'Spotkanie zarządu 17:30', x:50, y:20 } }, next:'end' },
      bprep_bad:{ speaker:'HR Ania', text:'Nie dziś. Popracuj nad narracją.', effects:{ stress:4 }, next:'end' },
      hr_bs1:{ speaker:'HR Ania', text:'Byłam kiedyś na liście. Przeniesiono mnie do innego działu. Przetrwałam.', next:'hr_bs2' },
      hr_bs2:{ speaker:'HR Ania', text:'Chcę, by procedury ratowały ludzi, nie tabelki.', check:{ skill:'Empatia', dc:12, success:'hr_bs_ok', failure:'hr_bs_fail' } },
      hr_bs_ok:{ speaker:'HR Ania', text:'Weź tę historię. To twoja karta „serce”.', effects:{ setFlag:{ hr_story:true, case_hr:true }, addObjective:{ id:'board_hr_story', label:'Dowód: historia HR (na zarząd)', x:48, y:30 } }, next:'end' },
      hr_bs_fail:{ speaker:'HR Ania', text:'Rozumiem, że dziś trudno. Wróć, jak będziesz gotów.', effects:{ stress:3 }, next:'end' },
      end: { speaker: 'HR Ania', text: 'Gdy będzie ciężko – przyjdź.' }
    }
  },
  mgmt: {
    nodes: {
      start: { speaker: 'PM', text: 'Wizja, roadmapa, metryki. I ludzie.', next: 'fork' },
      fork: {
        title: 'Management – ścieżka', text: 'Jak gramy?',
        choices: [
          { id: 'vision', label: 'Wizja ponad chaos', effects: { rep: { mgmt: 15 }, jira: 2 }, next: 'v1' },
          { id: 'shield', label: 'Zasłonić zespół przed presją', effects: { rep: { mgmt: 10 }, stress: -8 }, next: 's1' },
          { id: 'board', label: 'Wejście na zarząd', requires: { mgmt: 25 }, next: 'b1' },
          { id: 'backstory', label: 'Mur dla zespołu', requires:{ mgmt:10 }, next:'m_bs1' },
        ]
      },
      v1: { speaker: 'PM', text: 'Bez sensu nie ma sprintu.', next: 'v2' },
      v2: { speaker: 'PM', text: 'Pokażesz ROI ludzkiego czasu – dostaniesz przestrzeń.', next: 'end' },
      s1: { speaker: 'PM', text: 'Mój mur. Wasza praca.', next: 's2' },
      s2: { speaker: 'PM', text: 'Ale mur pęka, gdy Excel krzyczy. Naucz go szeptać.', next: 'end' },
      b1: { speaker: 'PM', text: 'Nie każdy chce tam iść. Ty możesz.', next: 'b2' },
      b2: { speaker: 'PM', text: 'Wejściówka na 17:30. Retoryka w pogotowiu.', effects: { setFlag: { board_invite: true }, objective: { id: 'board_meeting', label: 'Spotkanie zarządu 17:30', x: 48, y: 30 } }, next: 'end' },
      m_bs1:{ speaker:'PM', text:'Kiedyś spadło na nas „z góry”. Wziąłem to na siebie.', next:'m_bs2' },
      m_bs2:{ speaker:'PM', text:'Od tego czasu wierzę w mur, który chroni zespół.', check:{ skill:'Grit', dc:12, success:'m_bs_ok', failure:'m_bs_fail' } },
      m_bs_ok:{ speaker:'PM', text:'Weź „cięcie zakresu, nie ludzi” na zarząd.', effects:{ setFlag:{ mgmt_scope:true, case_ops_risk:true }, addObjective:{ id:'board_scope_case', label:'Dowód: cięcie zakresu (na zarząd)', x:48, y:30 } }, next:'end' },
      m_bs_fail:{ speaker:'PM', text:'Mur buduje się cegłami. Dziś wziąłeś jedną.', effects:{ stress:3 }, next:'end' },
      end: { speaker: 'PM', text: 'Wracaj z planem lub pytaniami.' }
    }
  },
  ceo: {
    nodes: {
      start: {
        title: 'Zarząd',
        text: 'Przepustka?',
        choices: [
          { id: 'enter', label: 'Pokaż wejściówkę', requiresFlags: { board_invite: true }, next: 'c1' },
          { id: 'leave', label: 'Nie mam… (wróć później)', next: 'no_entry' }
        ]
      },
      no_entry: { speaker: 'Ochrona', text: 'Wejście tylko z przepustką. 17:30.', next: 'end' },
      c1: { speaker: 'CEO', text: 'Masz 3 minuty. Bez slajdów.', next: 'c_choice1' },
      c_choice1: { title: 'Wystąpienie', text: 'Jak zaczniesz?', choices: [
        { id: 'ret', label: 'Opowieść o ludziach (Empatia)', check: { skill: 'Empatia', dc: 13, success: 'c_ret_ok', failure: 'c_ret_bad' } },
        { id: 'log', label: 'Twarde dane (Logika)', check: { skill: 'Logika', dc: 13, success: 'c_log_ok', failure: 'c_log_bad' } },
        { id: 'mix', label: 'Most: dane + ludzie (Retoryka)', check: { skill: 'Retoryka', dc: 14, success: 'c_mix_ok', failure: 'c_mix_bad' } },
        { id: 'backstory', label: 'Backstory: Empatia+Grit', check: { skill: 'Empatia', dc: 10, success: 'c_bs_gate', failure: 'c_ret_bad' } },
        { id: 'stack', label: 'Trzy prawdy: człowiek+liczba+ryzyko', requiresFlags:{ case_hr:true, case_it:true, case_ops_risk:true }, next:'c_stack_ok' }
      ]},
      c_stack_ok:{ speaker:'CEO', text:'Masz wszystko: człowieka, liczbę i ryzyko. Słucham.', effects:{ setFlag:{ ceo_mix:true } }, next:'c2' },
      c_bs_gate: { speaker: 'Narrator', text: 'Łączysz czułość z uporem. Czy wytrzymasz?', check: { skill: 'Grit', dc: 12, success: 'c_ret_ok', failure: 'c_ret_bad' } },
      c_ret_ok: { speaker: 'CEO', text: 'Nie jestem potworem. Ale Excel nie ma serca.', effects: { setFlag: { ceo_emp: true } }, next: 'c2' },
      c_ret_bad: { speaker: 'CEO', text: 'To nie terapia. Liczby.', effects: { stress: 6 }, next: 'c2' },
      c_log_ok: { speaker: 'CEO', text: 'Wreszcie konkret.', effects: { setFlag: { ceo_log: true } }, next: 'c2' },
      c_log_bad: { speaker: 'CEO', text: 'Te dane bez narracji są puste.', effects: { stress: 6 }, next: 'c2' },
      c_mix_ok: { speaker: 'CEO', text: 'Rzadkie połączenie. Słucham dalej.', effects: { setFlag: { ceo_mix: true } }, next: 'c2' },
      c_mix_bad: { speaker: 'CEO', text: 'Chciałeś wszystko naraz. Dostałem nic.', effects: { stress: 8 }, next: 'c2' },
      c2: { speaker: 'CEO', text: 'Co poświęcicie, by ocalić zespół?', next: 'c_choice2' },
      c_choice2: { title: 'Cena', text: 'Decyzja?', choices: [
        { id: 'self', label: 'Siebie – odejdę, zespół zostaje', effects: { setFlag: { end_self: true } }, next: 'c3' },
        { id: 'scope', label: 'Zakres – tniemy funkcje, nie ludzi', effects: { setFlag: { end_scope: true } }, next: 'c3' },
        { id: 'truth', label: 'Prawdę – ujawniam błędy decyzji', effects: { setFlag: { end_truth: true } }, next: 'c3' }
      ]},
      c3: { speaker: 'CEO', text: 'Ostatnie słowo.', next: 'c4' },
      c4: { speaker: 'Ty', text: 'Jeśli dziś umrzemy w tej firmie, jutro będzie ogłoszenie o pracę.', next: 'c5' },
      c5: { speaker: 'Ty', text: 'Ale bliscy będą tęsknić zawsze.', next: 'c_final' },
      c_final: { speaker: 'CEO', text: '…', next: 'ending_router' },
      ending_router: { title: 'Zakończenie', text: 'Która prawda stanie się twoją?', choices: [
        { id: 'E1', label: 'Oddaj siebie', requiresFlags: { end_self: true }, next: 'end_self' },
        { id: 'E2', label: 'Ocal ludzi zakresem', requiresFlags: { end_scope: true }, next: 'end_scope' },
        { id: 'E3', label: 'Powiedz prawdę', requiresFlags: { end_truth: true }, next: 'end_truth' },
        { id: 'E4', label: 'Zemdlej pod ciężarem absurdu (sekret)', requiresStress:{ min: 96 }, next: 'stress_secret' }
      ]},
      // secret stress ending (auto triggers if stress > 95 when entering endings)
      stress_secret: { speaker:'Narrator', text:'Próbujesz mówić… ale żołądek mówi pierwszy.', next:'stress_secret2' },
      stress_secret2:{ speaker:'CEO', text:'…', next:'stress_secret3' },
      stress_secret3:{ speaker:'Narrator', text:'Na dywanie zostaje coś więcej niż prezentacja. W open space śmiech miesza się z ciszą.', next:'end_common' },
      end_self: { speaker: 'Narrator', text: 'Oddajesz identyfikator. Korytarz dłuższy niż zwykle. SMS od zespołu: „Dzięki. Żyj.”', next: 'end_common' },
      end_scope: { speaker: 'Narrator', text: 'Tniecie funkcje, nie ludzi. Produkt skromniejszy, zespół żyje.', next: 'end_common' },
      end_truth: { speaker: 'Narrator', text: 'Mówisz prawdę. Nie wszystkim się podoba. Ale ktoś w końcu zasługuje na nią.', next: 'end_common' },
      end_common: { speaker: 'Narrator', text: 'Jutro firma opublikuje ogłoszenie. Ale bliscy nie ogłoszą, że przestali tęsknić.', next: 'end' },
      end: { speaker: 'Narrator', text: 'Koniec dnia. Zostaje człowiek.' }
    }
  },
  // Lightweight dialog hooks for new NPCs (mini-wątki i powiązania z raportem)
  mkt1: { nodes:{
    start:{ speaker:'Marketing Kasia', text:'Masz historię. Ja mam narrację. Chcesz pomocy?', next:'c1' },
    c1:{ title:'Narracja', text:'Co ubrać w słowa?', choices:[
      { id:'hr', label:'Człowiek – case HR (Empatia)', check:{ skill:'Empatia', dc:11, success:'ok', failure:'bad' } },
      { id:'mix', label:'Most: liczby+człowiek (Retoryka)', check:{ skill:'Retoryka', dc:12, success:'ok', failure:'bad' } },
    ]},
    ok:{ speaker:'Marketing Kasia', text:'Masz to. Twoje „Dane” będą mówić.', effects:{ rep:{ mgmt:4 }, jira:1 }, next:'end' },
    bad:{ speaker:'Marketing Kasia', text:'Za dużo żargonu. Odetchnij i wróć.', effects:{ stress:3 }, next:'end' },
    end:{ speaker:'Marketing Kasia', text:'Powiedz prawdę – ja ją podkreślę.' }
  }},
  law1: { nodes:{
    start:{ speaker:'Legal Marta', text:'Raport musi być etyczny. I legalny.', next:'c1' },
    c1:{ title:'Legal', text:'Dodać klauzulę?', choices:[
      { id:'yes', label:'Tak – chronimy ludzi', next:'ok' },
      { id:'no', label:'Nie – ryzykujmy', next:'bad' },
    ]},
    ok:{ speaker:'Legal Marta', text:'Dobrze. Chronisz nie tylko siebie.', effects:{ rep:{ mgmt:4 }, setFlag:{ case_ops_risk:true } }, next:'end' },
    bad:{ speaker:'Legal Marta', text:'Odważnie. Czasem za odważnie.', effects:{ stress:4 }, next:'end' },
    end:{ speaker:'Legal Marta', text:'Pamiętaj: prawda bez kontekstu potrafi ranić.' }
  }},
  rnd1: { nodes:{
    start:{ speaker:'R&D Antek', text:'Mam pseudodane syntetyczne do testów.', next:'c1' },
    c1:{ title:'Dane', text:'Wykorzystać je?', choices:[
      { id:'use', label:'Tak – pokaż trend', next:'ok' },
      { id:'skip', label:'Nie – tylko produkcja', next:'end' }
    ]},
    ok:{ speaker:'R&D Antek', text:'Masz +1 Dane. Nie oszukują – uczą.', effects:{ jira:1 }, next:'end' },
    end:{ speaker:'R&D Antek', text:'Wracaj, gdy będziesz chciał pobawić się hipotezami.' }
  }},
  ds1: { nodes:{
    start:{ speaker:'Data Science Magda', text:'Masz historię, ja mam wykres.', next:'c1' },
    c1:{ title:'Wykres', text:'Jaki? ', choices:[
      { id:'line', label:'Linia – trajektoria ludzi', next:'ok' },
      { id:'bar', label:'Słupki – prosta prawda', next:'ok' }
    ]},
    ok:{ speaker:'Data Science Magda', text:'Niech liczby będą empatyczne.', effects:{ rep:{ it:3 }, jira:1 }, next:'end' },
    end:{ speaker:'Data Science Magda', text:'Nie zabijaj historii wykresem.' }
  }},
  lou1: { nodes:{
    start:{ speaker:'Barista Leon', text:'Flat white do raportu?', next:'ok' },
    ok:{ speaker:'Barista Leon', text:'Masz spokój w kubku.', effects:{ stress:-6 }, next:'end' },
    end:{ speaker:'Barista Leon', text:'Oddychaj.' }
  }},
};


