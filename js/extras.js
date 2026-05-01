// ============================================================
// extras.js — Badges, Popup Facts, Reading Bar, Motivational Popup
// ============================================================

// ---- BADGE MANAGER ----
const BadgeManager = (() => {
  const KEY = 'ssb_badges';

  const BADGE_DEFS = {
    first_read:     { icon: '📰', name: 'First Article', desc: 'Read your first article' },
    news_10:        { icon: '📚', name: 'News Veteran', desc: 'Read 10 articles' },
    news_25:        { icon: '🗞️', name: 'News Addict', desc: 'Read 25 articles' },
    streak_3:       { icon: '🔥', name: '3-Day Streak', desc: 'Visited 3 days in a row' },
    streak_7:       { icon: '🔥🔥', name: 'Week Warrior', desc: 'Visited 7 days in a row' },
    streak_30:      { icon: '💎', name: 'Iron Discipline', desc: '30-day streak achieved' },
    first_quiz:     { icon: '🧠', name: 'First Quiz', desc: 'Completed your first quiz question' },
    quiz_10:        { icon: '🎯', name: 'Quiz Ace', desc: 'Attempted 10 quiz questions' },
    quiz_score_5:   { icon: '⭐', name: 'Sharp Mind', desc: 'Got 5 correct answers' },
    bookmarks_5:    { icon: '🔖', name: 'Curator', desc: 'Saved 5 articles' },
    study_1hr:      { icon: '⏰', name: 'Dedicated', desc: 'Studied for 1 hour total' },
    all_sections:   { icon: '🏅', name: 'Explorer', desc: 'Visited all sections' },
    night_owl:      { icon: '🦉', name: 'Night Owl', desc: 'Studied after midnight' },
  };

  function getUnlocked() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }

  function unlock(badgeId) {
    if (!BADGE_DEFS[badgeId]) return;
    const unlocked = getUnlocked();
    if (unlocked.find(b => b.id === badgeId)) return; // Already have it

    const badge = { id: badgeId, ...BADGE_DEFS[badgeId], unlockedAt: new Date().toISOString() };
    unlocked.push(badge);
    localStorage.setItem(KEY, JSON.stringify(unlocked));

    showBadgePopup(badge);
    renderBadges();
  }

  function showBadgePopup(badge) {
    const el = document.createElement('div');
    el.className = 'badge-unlock-popup';
    el.innerHTML = `
      <div class="badge-unlock-inner">
        <div class="badge-unlock-icon">${badge.icon}</div>
        <div>
          <div class="badge-unlock-title">🏆 Badge Unlocked!</div>
          <div class="badge-unlock-name">${badge.name}</div>
          <div class="badge-unlock-desc">${badge.desc}</div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('badge-popup-show'), 50);
    setTimeout(() => { el.classList.remove('badge-popup-show'); setTimeout(() => el.remove(), 600); }, 4000);
  }

  function renderBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    const unlocked = getUnlocked();
    const all = Object.entries(BADGE_DEFS);

    container.innerHTML = all.map(([id, badge]) => {
      const have = unlocked.find(b => b.id === id);
      return `
        <div class="badge-item ${have ? 'badge-earned' : 'badge-locked'}" title="${badge.desc}">
          <div class="badge-icon">${have ? badge.icon : '🔒'}</div>
          <div class="badge-name">${badge.name}</div>
          ${have ? `<div class="badge-date">${new Date(have.unlockedAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</div>` : ''}
        </div>
      `;
    }).join('');

    // Update badge count
    const countEl = document.getElementById('badge-count');
    if (countEl) countEl.textContent = `${unlocked.length}/${all.length}`;
  }

  // Night owl check
  function checkNightOwl() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) unlock('night_owl');
  }

  return { unlock, getUnlocked, renderBadges, checkNightOwl, BADGE_DEFS };
})();

// ---- READING PROGRESS BAR ----
const ReadingProgressBar = (() => {
  function init() {
    const bar = document.getElementById('reading-progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      bar.style.width = `${pct}%`;
    });
  }
  return { init };
})();

// ---- POPUP FACTS (Defence/Geopolitics/SSB) ----
const PopupFacts = (() => {
  const facts = [
    { icon: '⚔️', text: 'India has the world\'s 2nd largest standing army with over 1.4 million active personnel.' },
    { icon: '🚀', text: 'BrahMos is the world\'s fastest operational supersonic cruise missile, capable of Mach 2.8.' },
    { icon: '🛡️', text: 'India\'s nuclear doctrine follows "No First Use" — it will not use nuclear weapons unless attacked first.' },
    { icon: '🚢', text: 'INS Vikrant is India\'s first indigenously built aircraft carrier, named after the hero of 1971.' },
    { icon: '🧠', text: 'SSB assesses 15 Officer Like Qualities across Psychological, Social, and Planning dimensions.' },
    { icon: '🌍', text: 'India is the founding member of the Non-Aligned Movement, established in 1961 in Belgrade.' },
    { icon: '✈️', text: 'The Indian Air Force is the world\'s 4th largest, with over 1,700 aircraft in its fleet.' },
    { icon: '🎖️', text: 'Param Vir Chakra, India\'s highest wartime gallantry award, has been awarded 21 times.' },
    { icon: '📡', text: 'India launched NavIC, its own regional navigation satellite system, reducing GPS dependence.' },
    { icon: '🔬', text: 'DRDO has over 52 laboratories working on everything from missiles to materials science.' },
    { icon: '🤝', text: 'India is the largest contributor to UN Peacekeeping missions with over 6,000 troops deployed.' },
    { icon: '🏔️', text: 'Siachen Glacier at 6,000m is the world\'s highest battlefield where Indian troops are posted.' },
    { icon: '⚡', text: 'Operation Vijay (1999) saw India\'s successful eviction of Pakistani forces from Kargil heights.' },
    { icon: '🎯', text: 'PPDT in SSB tests leadership, communication, and initiative in group discussion settings.' },
    { icon: '🌊', text: 'India\'s Exclusive Economic Zone spans 2.37 million sq km — the 16th largest in the world.' },
    { icon: '🛸', text: 'India successfully tested an anti-satellite (ASAT) weapon in 2019 under Mission Shakti.' },
    { icon: '📊', text: 'India aims to achieve 25% of its defence needs through domestic production under Aatmanirbhar Bharat.' },
    { icon: '🦅', text: 'The motto of the Indian Army is "Service Before Self" — a principle every officer must embody.' },
    { icon: '🚢', text: 'INS Vikrant is India’s first indigenously designed and built aircraft carrier, making India one of the few nations with this capability.' },
    { icon: '🚀', text: 'India’s BrahMos missile is the world’s fastest supersonic cruise missile, developed as a joint venture with Russia.' },
    { icon: '🚁', text: 'The Prachand Light Combat Helicopter is the only attack helicopter in the world that can land and take off at an altitude of 5,000 meters.' },
    { icon: '🛰️', text: 'Mission Shakti made India the fourth nation in the world to possess Anti-Satellite (ASAT) missile capabilities.' },
    { icon: '🔫', text: 'India has indigenously developed the INSAS rifle and is now shifting toward the advanced AK-203 produced in Amethi.' },
    { icon: '🛡️', text: 'The "Negative Import List" now includes over 4,000 items that the Indian Armed Forces can only procure from domestic manufacturers.' },
    { icon: '🛩️', text: 'HAL Tejas is a 4.5-generation indigenous fighter jet, recognized as the smallest and lightest multi-role supersonic fighter in its class.' },
    { icon: '💰', text: 'India’s defence exports reached an all-time high of ₹21,083 crore in FY 2023-24, exporting to over 85 countries.' },
    { icon: '🏗️', text: 'The Tata Aircraft Complex in Vadodara is India’s first private-sector final assembly line for military aircraft (C-295).' },
    { icon: '💥', text: 'The Pinaka Multi-Barrel Rocket Launcher system, developed by DRDO, is highly sought after globally for its precision and firepower.' },
    { icon: '🐘', text: 'The Arjun MBT Mk-1A is India’s premier indigenous Main Battle Tank, featuring 72 new upgrades over its predecessor.' },
    { icon: '📡', text: 'India’s NAVIC (Navigation with Indian Constellation) provides independent positioning services for military and civilian use.' },
    { icon: '🌊', text: 'The Arihant-class submarines are India’s first indigenously built nuclear-powered ballistic missile submarines.' },
    { icon: '🎯', text: 'The Astra missile is India’s first indigenous Beyond Visual Range (BVR) air-to-air missile.' },
    { icon: '👢', text: 'In a boost for local manufacturing, "Made in Bihar" boots have been supplied to the Russian Army.' },
    { icon: '⚓', text: 'The Indian Navy’s motto is "Sham-no Varunah," which translates to "May the Lord of Oceans be auspicious unto us."' },
    { icon: '☁️', text: 'The Indian Air Force motto "Nabha Sparsham Deeptam" (Touch the Sky with Glory) is taken from the Bhagavad Gita.' },
    { icon: '🐆', text: 'The Garud Commando Force is the elite special forces unit of the Indian Air Force, specializing in airfield protection.' },
    { icon: '🐅', text: 'The motto of the Rajputana Rifles is "Veer Bhogya Vasundhara," meaning "The Brave shall inherit the Earth."' },
    { icon: '🦁', text: 'The Sikh Regiment’s motto "Nischay Kar Apni Jeet Karon" means "With determination, I will be triumphant."' },
    { icon: '⚔️', text: 'The motto of the Kumaon Regiment is "Parakramo Vijayate," which translates to "Valour Triumphs."' },
    { icon: '🏔️', text: 'The Indo-Tibetan Border Police (ITBP) motto is "Shaurya, Dridhta, Karm Nishtha" (Valour, Determination, Devotion to Duty).' },
    { icon: '🐕', text: 'The Indian Army’s Remount and Veterinary Corps (RVC) trains dogs and horses that have received gallantry awards for service.' },
    { icon: '🎺', text: 'The "Beating Retreat" ceremony at Vijay Chowk marks the end of Republic Day festivities with traditional military music.' },
    { icon: '🏔️', text: 'India maintains the world’s highest battlefield at Siachen Glacier, located at an altitude of approximately 20,000 feet.' },
    { icon: '🔝', text: 'India is the most populous democracy in the world and has the second-largest standing army.' },
    { icon: '📉', text: 'Despite being a major military power, India has never invaded any country in her last 10,000 years of history.' },
    { icon: '🗳️', text: 'India’s 2024 General Elections were the largest democratic exercise in human history with nearly 970 million voters.' },
    { icon: '🛰️', text: 'India was the first country to reach Mars on its maiden attempt with the Mangalyaan mission.' },
    { icon: '🌗', text: 'In 2023, India became the first country to land a spacecraft (Chandrayaan-3) near the lunar South Pole.' },
    { icon: '🛤️', text: 'The Indian Railways is one of the world’s largest employers, with over 1.2 million employees.' },
    { icon: '🥛', text: 'India is the world’s largest producer of milk, accounting for about 24% of global milk production.' },
    { icon: '🏤', text: 'India has the largest postal network in the world, including a floating post office in Dal Lake, Srinagar.' },
    { icon: '🧘', text: 'Yoga originated in ancient India over 5,000 years ago and is now celebrated globally on June 21st.' },
    { icon: '🔢', text: 'The concept of "Zero" and the decimal system were invented in India by mathematicians like Aryabhata.' },
    { icon: '🏢', text: 'iDEX (Innovations for Defence Excellence) was launched to fund startups developing cutting-edge tech for the military.' },
    { icon: '🧪', text: 'DRDO operates a network of 52 laboratories dedicated to developing electronic, land, and naval combat systems.' },
    { icon: '🗺️', text: 'The Andaman and Nicobar Command is India’s first and only "Tri-service" theater command.' },
    { icon: '⚡', text: 'The Nirbhay missile is India’s first indigenous long-range subsonic cruise missile, capable of carrying nuclear warheads.' },
    { icon: '🚜', text: 'The Border Roads Organization (BRO) built "Umling La," the highest motorable road in the world at 19,024 feet.' },
    { icon: '📡', text: 'India’s "Integrated Guided Missile Development Programme" (IGMDP) laid the foundation for Agni and Akash missiles.' },
    { icon: '🩺', text: 'The Army Medical Corps motto is "Sarve Santu Niramaya," meaning "May all be free from disease."' },
    { icon: '🕊️', text: 'India is one of the largest troop contributors to United Nations Peacekeeping missions worldwide.' },
    { icon: '🏗️', text: 'The Chenab Bridge in J&K is the world\'s highest railway bridge, built to withstand high-intensity seismic zones.' },
    { icon: '🛠️', text: 'Under the "Make-II" category, the government provides simplified procedures for industry-funded indigenous prototypes.' },
    { icon: '🧥', text: 'India has indigenized the production of Extreme Cold Weather Clothing Systems (ECWCS) for soldiers in high altitudes.' },
    { icon: '🌉', text: 'The Atal Tunnel is the longest single-tube highway tunnel in the world above 10,000 feet.' },
    { icon: '🐅', text: 'India is home to over 75% of the world’s wild tiger population, a result of successful conservation efforts.' },
    { icon: '🎓', text: 'The National Defence Academy (NDA) in Khadakwasla is the world’s first tri-service academy.' },
    { icon: '🚩', text: 'The Indian national flag is made of Khadi and must be manufactured according to Bureau of Indian Standards (BIS) specs.' },
    { icon: '🚁', text: 'The HAL Prachand is the only attack helicopter in the world capable of operating at altitudes above 5,000 meters.' },
    { icon: '🚀', text: 'The Agni-V is India’s intercontinental ballistic missile (ICBM) with a range exceeding 5,000 kilometers.' },
    { icon: '🛳️', text: 'INS Mormugao is one of the world’s most advanced guided-missile destroyers, with 75% indigenous content.' },
    { icon: '🏔️', text: 'The High Altitude Warfare School (HAWS) in Gulmarg is one of the most elite military training centers globally.' },
    { icon: '🛡️', text: 'India’s BMD (Ballistic Missile Defence) shield makes it one of the few nations capable of intercepting incoming nuclear missiles.' },
    { icon: '🐅', text: 'The Para (Special Forces) are known as the "Red Devils" and are among the oldest airborne units in the world.' },
    { icon: '🦅', text: 'The MARCOS (Marine Commandos) are trained to operate in all three environments: Sea, Air, and Land.' },
    { icon: '🛰️', text: 'GSAT-7A, known as the "Angry Bird," is a dedicated military communication satellite for the Indian Air Force.' },
    { icon: '🔫', text: 'The "Vidhwansak" is an indigenous multi-caliber anti-materiel rifle used by Indian border forces.' },
    { icon: '⛴️', text: 'INS Vikrant’s flight deck is large enough to fit two football fields.' },
    { icon: '🔥', text: 'The Pinaka Mk-II can fire a rocket salvo of 12 rockets in just 44 seconds.' },
    { icon: '🇮🇳', text: 'India has the world’s largest volunteer army; there has never been a forced conscription in the country.' },
    { icon: '🌊', text: 'The Indian Navy’s "Project 75" focuses on building advanced Scorpene-class stealth submarines.' },
    { icon: '🛸', text: 'The "TAPAS-BH-201" is India’s indigenous Medium Altitude Long Endurance (MALE) unmanned aerial vehicle.' },
    { icon: '🏗️', text: 'The Border Roads Organization (BRO) built the world’s highest fighter airbase at Nyoma in Ladakh.' },
    { icon: '📜', text: 'The Indian Constitution is the longest written constitution of any sovereign country in the world.' },
    { icon: '💎', text: 'India was the only source of diamonds in the world until the 18th century.' },
    { icon: '🚂', text: 'Vivek Express covers the longest train route in India, traveling 4,189 km from Dibrugarh to Kanyakumari.' },
    { icon: '🗳️', text: 'In the 2024 elections, a polling station was set up for a single voter in the Gir Forest of Gujarat.' },
    { icon: '🐆', text: 'India successfully reintroduced Cheetahs from Africa into Kuno National Park after 70 years of extinction.' },
    { icon: '🍚', text: 'India is the world’s largest exporter of rice, feeding millions across the globe.' },
    { icon: '🕌', text: 'India has the largest number of mosques in the world, totaling over 300,000.' },
    { icon: '🏥', text: 'The "Arogya Maitri Cube" is the world’s first portable hospital, developed indigenously by India.' },
    { icon: '🔋', text: 'India is home to the world’s largest single-location solar power plant in Bhadla, Rajasthan.' },
    { icon: '🐍', text: 'Snakes and Ladders, the popular board game, originated in ancient India as "Mokshapat."' },
    { icon: '🧥', text: 'The Indian Army uses "Smart Jackets" with integrated GPS and sensors developed by indigenous startups.' },
    { icon: '🌪️', text: 'BrahMos NG (Next Generation) is a smaller, stealthier version of the missile being developed for fighter jets.' },
    { icon: '📡', text: 'The "Swathi" Weapon Locating Radar can track incoming artillery shells and rockets from 50 km away.' },
    { icon: '🚢', text: 'INS Arighat is India’s second nuclear-powered ballistic missile submarine, commissioned to strengthen the nuclear triad.' },
    { icon: '🐅', text: 'The "Cobra" (Commando Battalion for Resolute Action) is a specialized unit of the CRPF for jungle warfare.' },
    { icon: '⚔️', text: 'The Brigade of The Guards was the first "all-class" infantry regiment of the Indian Army.' },
    { icon: '🪖', text: 'The "TATA Kestrel" (WhAP) is an 8x8 amphibious armored personnel carrier developed indigenously.' },
    { icon: '🎯', text: 'The "Nag" missile is a third-generation "fire-and-forget" anti-tank guided missile.' },
    { icon: '🧪', text: 'DRDO’s "Asmi" is India’s first indigenous 9mm Machine Pistol.' },
    { icon: '🏙️', text: 'Bangalore is known as the "Silicon Valley of India" and is a global hub for defence electronics.' },
    { icon: '🩺', text: 'India is known as the "Pharmacy of the World" for its massive production of affordable generic drugs.' },
    { icon: '🦜', text: 'The Himalayan Monal is a stunning bird often spotted near Indian Army posts in the high Himalayas.' },
    { icon: '🕉️', text: 'Kumbh Mela is the largest peaceful gathering of humans on Earth, visible from space.' },
    { icon: '🏏', text: 'The Chail Cricket Ground in Himachal Pradesh is the highest cricket ground in the world.' },
    { icon: '🍛', text: 'India is the "Land of Spices," producing over 70% of the world’s spice supply.' },
    { icon: '🦓', text: 'The Statue of Unity in Gujarat is the world’s tallest statue, standing at 182 meters.' },
    { icon: '🎭', text: 'India’s film industry (Bollywood/Tollywood/etc.) is the world’s largest in terms of tickets sold.' },
    { icon: '🧠', text: 'Ayurveda is considered the oldest healing system in the world, originating in India.' },
    { icon: '🌊', text: 'India has a coastline of over 7,516 kilometers, protected by the Indian Navy and Coast Guard.' },
    { icon: '🐘', text: 'The "Elephant Walk" is a military term for a close-formation taxiing of military aircraft before takeoff.' },
    { icon: '✈️', text: 'The "Saras" is India’s first indigenous multi-purpose civilian aircraft developed by NAL.' },
    { icon: '💂', text: 'The President’s Bodyguard is the senior-most regiment of the Indian Army.' },
    { icon: '🛠️', text: 'The "Kalyani M4" is a high-protection armored vehicle built in India for peacekeeping and combat.' },
    { icon: '🌞', text: 'India spearheaded the International Solar Alliance (ISA) to promote renewable energy globally.' },
    { icon: '🏔️', text: 'The Rohtang Tunnel (Atal Tunnel) is the longest highway tunnel above 10,000 feet in the world.' },
    { icon: '🛰️', text: 'India holds the world record for launching 104 satellites in a single mission using the PSLV-C37.' },
    { icon: '💻', text: 'India has the second-largest pool of scientists and engineers in the world.' },
    { icon: '🐆', text: 'The "Panther" is a specialized mountain-climbing robot developed by DRDO for surveillance.' },
    { icon: '🪂', text: 'The Indian Army’s Skydiving Team is called "Phoenix."' },
    { icon: '🚩', text: 'The Chhatrapati Shivaji Maharaj-inspired "New Naval Ensign" removed the colonial St. George’s Cross.' },
    { icon: '🛶', text: 'India’s first rocket was transported to the launch site on a bicycle in 1963.' },
    { icon: '🍃', text: 'Sikkim became the world’s first "fully organic" state in 2016.' },
    { icon: '💧', text: 'The village of Mawsynram in Meghalaya is the wettest place on Earth.' },
    { icon: '🐅', text: 'The "Bengal Tiger" is the national animal, symbolizing power, agility, and grace.' },
    { icon: '🦢', text: 'The "Hamsa" is an indigenous trainer aircraft used for basic flight training.' },
    { icon: '🏭', text: 'India is the world’s second-largest producer of crude steel.' },
    { icon: '📱', text: 'India has the world’s lowest data prices and the highest mobile data consumption per user.' },
    { icon: '🐄', text: 'India has the largest cattle population in the world.' },
    { icon: '🧊', text: 'The "Indra" series is a major biennial military exercise conducted between India and Russia.' },
    { icon: '🌪️', text: 'The "Sudharshan" is a laser-guided bomb kit developed by DRDO to improve strike precision.' },
    { icon: '🏗️', text: 'India is building the "Udhampur-Srinagar-Baramulla" rail link, one of the toughest engineering projects.' },
    { icon: '🏛️', text: 'The Nalanda University was one of the world’s first residential universities, founded in the 5th century.' },
    { icon: '🍵', text: 'India is the second-largest producer of tea in the world.' },
    { icon: '🚇', text: 'The Delhi Metro is one of the few metro systems in the world that is carbon-neutral.' },
    { icon: '🦅', text: 'The "Eagle" (Shikra) is the name of the Indian Navy’s air station in Mumbai.' },
    { icon: '🛶', text: 'The "Snake Boat Race" in Kerala is the world’s largest team sport.' },
    { icon: '🌉', text: 'The Bandra-Worli Sea Link has steel wires equal to the Earth’s circumference.' },
    { icon: '🏹', text: 'The "Dhanush" is a 155mm artillery gun, often called the "Desi Bofors."' },
    { icon: '🐅', text: 'The "Tigersher" (Mirage 2000) played a pivotal role in the Kargil War of 1999.' },
    { icon: '🚁', text: 'India’s "Cheetah" helicopters hold the world record for the highest flying altitude for their class.' },
    { icon: '📡', text: 'The "Akash" surface-to-air missile can engage multiple targets simultaneously in all weather.' },
    { icon: '🎖️', text: 'The Param Vir Chakra is India’s highest wartime gallantry award.' },
    { icon: '🕯️', text: 'The "Eternal Flame" (Amar Jawan Jyoti) now burns at the National War Memorial.' },
    { icon: '🚢', text: 'India’s "Project 15B" destroyers are among the most powerful stealth ships in the Indian Ocean.' },
    { icon: '🌅', text: 'Dong in Arunachal Pradesh is the first place in India to witness the sunrise.' },
    { icon: '🎡', text: 'The "Delhi Eye" is one of the tallest Ferris wheels in the world.' },
    { icon: '🛡️', text: 'The "Abhay" is an indigenous Infantry Combat Vehicle (ICV) being developed by DRDO.' },
    { icon: '🔋', text: 'India is the first country to have a ministry dedicated to non-conventional energy (MNRE).' },
    { icon: '🪖', text: 'The "Bulletproof Jacket" (Bhabha Kavach) is the lightest indigenous armor for Indian soldiers.' },
    { icon: '🐯', text: 'The "White Tiger" was first discovered in the wild in Rewa, Madhya Pradesh.' },
    { icon: '🏔️', text: 'The Ladakh Scouts are known as the "Snow Warriors" of the Indian Army.' },
    { icon: '⚓', text: 'The "Milan" exercise is a biennial multilateral naval exercise hosted by India.' },
    { icon: '🚀', text: 'India’s "Prithvi" was the first missile developed under the IGMDP program.' },
    { icon: '🛰️', text: 'India has its own regional GPS called "NavIC" for high-precision navigation.' },
    { icon: '🎭', text: 'The Sanskrit language is considered the "Mother of all European languages" by many linguists.' },
    { icon: '🧂', text: 'The Sambhar Lake in Rajasthan is India’s largest inland salt lake.' },
    { icon: '🏜️', text: 'The Thar Desert is the most densely populated desert in the world.' },
    { icon: '🎹', text: 'The National Anthem of India, "Jana Gana Mana," was originally composed in Bengali.' },
    { icon: '🛶', text: 'The "Dhoop-Chhaon" silk from India is famous for changing colors in different lights.' },
    { icon: '🧥', text: 'The Pashmina shawls of Kashmir are made from the finest wool in the world.' },
    { icon: '🦁', text: 'The Gir National Park is the only place in the world where Asiatic Lions are found.' },
    { icon: '🌳', text: 'The Great Banyan Tree in Kolkata is the world’s largest tree by canopy area.' },
    { icon: '♟️', text: 'Chess was invented in India and was originally known as "Chaturanga."' },
    { icon: '🔬', text: 'The "Sir JC Bose" was the first scientist to prove that plants have feelings.' },
    { icon: '🇮🇳', text: 'India’s name is derived from the River Indus, which itself comes from the Sanskrit word "Sindhu."' }
  ];

  let shownFacts = [];
  let popupTimeout = null;

  function init() {
    // Show first fact after 45 seconds, then randomly every 3-7 minutes
    scheduleNextFact(45000);
  }

  function scheduleNextFact(delay) {
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
      showFact();
      const nextDelay = (Math.random() * 4 + 3) * 60000; // 3-7 min
      scheduleNextFact(nextDelay);
    }, delay);
  }

  function showFact() {
    // Don't show if modal is open or user is actively interacting
    if (document.querySelector('.modal-open')) return;

    let available = facts.filter((_, i) => !shownFacts.includes(i));
    if (!available.length) { shownFacts = []; available = facts; }

    const idx = Math.floor(Math.random() * available.length);
    const fact = available[idx];
    shownFacts.push(facts.indexOf(fact));

    const el = document.createElement('div');
    el.className = 'fact-popup';
    el.innerHTML = `
      <div class="fact-popup-header">
        <span class="fact-label">💡 Did You Know?</span>
        <button class="fact-close" onclick="this.closest('.fact-popup').remove()">✕</button>
      </div>
      <div class="fact-content">
        <span class="fact-icon">${fact.icon}</span>
        <p>${fact.text}</p>
      </div>
    `;

    document.body.appendChild(el);
    setTimeout(() => el.classList.add('fact-popup-show'), 50);
    setTimeout(() => {
      el.classList.remove('fact-popup-show');
      setTimeout(() => el.remove(), 600);
    }, 8000);
  }

  return { init, showFact };
})();

// ---- MOTIVATIONAL POPUP ----
const MotivationalManager = (() => {
  const quotes = [
    { quote: "The more you sweat in peace, the less you bleed in war.", author: "Norman Schwarzkopf" },
    { quote: "It is not the strength of the body that counts, but the strength of the spirit.", author: "J.R.R. Tolkien" },
    { quote: "Discipline is the soul of an army.", author: "George Washington" },
    { quote: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
    { quote: "A true soldier fights not because he hates what is in front of him, but because he loves what is behind him.", author: "G.K. Chesterton" },
    { quote: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek" },
    { quote: "Hard training, easy war. Easy training, hard war.", author: "Field Marshal Suvorov" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  ];

  function show() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const el = document.createElement('div');
    el.className = 'motivational-popup';
    el.innerHTML = `
      <div class="motivational-content">
        <div class="motivational-icon">🎖️</div>
        <blockquote class="motivational-quote">"${q.quote}"</blockquote>
        <cite class="motivational-author">— ${q.author}</cite>
        <button class="btn-sm btn-primary" onclick="this.closest('.motivational-popup').remove()">
          💪 Stay Focused
        </button>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('motivational-show'), 50);
  }

  function scheduleDaily() {
    const today = new Date().toISOString().split('T')[0];
    const lastShown = localStorage.getItem('ssb_last_motivational');
    if (lastShown !== today) {
      setTimeout(() => { show(); localStorage.setItem('ssb_last_motivational', today); }, 8000);
    }
  }

  return { show, scheduleDaily };
})();

// ---- CONTINUE READING ----
const ContinueReading = (() => {
  function render(allNews) {
    const container = document.getElementById('continue-reading-banner');
    if (!container) return;

    const lastId = parseInt(localStorage.getItem('ssb_last_viewed'));
    if (!lastId) { container.style.display = 'none'; return; }

    const article = allNews.find(n => n.id === lastId);
    if (!article) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="continue-inner">
        <span class="continue-label">↩️ Continue Reading</span>
        <span class="continue-title">${article.image} ${article.title}</span>
        <button class="btn-sm btn-primary" onclick="App.openArticle(${article.id})">Read →</button>
      </div>
    `;
  }
  return { render };
})();
