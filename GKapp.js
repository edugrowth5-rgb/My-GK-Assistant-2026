const savedData = {
    "Unique Animals": [
        "Secretary bird", "Civet", "Addax", "Puffin", "Kouprey", "Spider monkey"
    ],
    "Laughter Therapy": [
        "Laughter therapy", "Immune system", "Stress management", "Sleep hygiene", "Heart health", "Social psychology"
    ],
    "Amazing Places": [
        "Pamukkale", "Caño Cristales", "Great Blue Hole", "Chocolate Hills", "Richat Structure", "The Wave Arizona"
    ],
    "Endangered Trees": [
        "Bois Dentelle Tree", "St Helena Gumwood Tree", "Hinton's Oak Tree", "Loulu tree", "Dragon Tree", "African Baobab Tree"
    ],
    "Spacewalk Legends": [
        "Susan Helms", "Anatoly Solovyev", "Zhai Zhigang", "Alexei Leonov", "Steve Robinson astronaut", "Svetlana Savitskaya"
    ],
    "Forts of India": [
        "Jaisalmer Fort", "Agra Fort", "Red Fort", "Mehrangarh Fort", "Purana Qila", "Amber Fort"
    ],
    "Women in Science": [
        "Gitanjali Rao", "Mangala Mani", "Jennifer Doudna", "Ritu Karidhal", "Cynthia Rosenzweig"
    ],
    "World's Most Amazing Natural Phenomena" : [
        "Moving Stones", "Baltic and North Seas Meet", "Penitentes", "Red Tides", "Fire Whirl", "Ice Circles" 
    ],
    "The Living Machine" : [ 
      "Neuron", "Red Blood Cells", "Stapes", "Eye Muscle", "Buttock Muscle", "Stapedius", "Patella (knee cap)",  "Aorta", "Lymphocytes" 
    ],
    "Futuristic World" : ["Farm Scrapers", "Windowless Planes", "Personal Rapid Transit", "Oceanix", "Ocean Spiral City", "Solar-powered House"
    ],
    "Scientific Instruments" : [
    "Hygrometer", "Binoculars", "Altimeter", "Electrocardiograph", "Electroscope", "Dynamo", "Anemometer", "Viscometer", "Barometer", "Hydrometer", "Amplifier", "Calorimeter"
    ],
    "What Am I?" : [
    "Poet", "Atheist", "Omniscient", "Orator", "Illiterate", "Pessimist", "Social Reformer", "Fatalist", "Linguist", "Honorary", "Effeminate", "Equestrian", "Optimist", "Traitor", "Philanthropist"
    ],
    "Indian Renaissance" : [
    "Swami Vivekanand", "Sree Narayana Guru", "Mirza Ghulam Ahmed", "Annie Besant", "Raja Ram Mohan Roy", "Swami Dayanand Saraswati", "Jyotiba Phule", "Debendranath Thakur", "Keshav Chandra Sen", "Mahadev Govind Ranade", "Swami Dayanand Saraswati", "Chembeti Shridharalu Naidu", "Kandukuri Veeresalingam", "Madam HP Blavatsky", "R K Bhandarkar"
    ]
};

let maleVoice = null;

window.onload = () => {
    initUI();
    setupVoices();
};

function toggleLeftSidebar() {
    document.getElementById('leftSidebar').classList.toggle('collapsed');
}

function initUI() {
    const container = document.getElementById('topicsContainer');
    for (let cat in savedData) {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-name';
        catDiv.innerText = cat.toUpperCase();
        container.appendChild(catDiv);

        savedData[cat].forEach(topic => {
            const item = document.createElement('div');
            item.className = 'topic-item';
            item.innerText = topic;
            item.onclick = () => {
                document.getElementById('searchInput').value = topic;
                executeSearch();
            };
            container.appendChild(item);
        });
    }
}

function setupVoices() {
    const load = () => {
        const voices = window.speechSynthesis.getVoices();
        maleVoice = voices.find(v => v.name.includes('Google US English') || v.name.toLowerCase().includes('male')) || voices[0];
    };
    window.speechSynthesis.onvoiceschanged = load;
    load();
}

async function executeSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    const status = document.getElementById('statusIndicator');
    status.innerText = "Searching...";
    status.style.background = "#f39c12";

    killSpeech();

    try {
        const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`;
        const sRes = await fetch(sUrl);
        const sData = await sRes.json();
        
        const title = sData.query.search[0].title;
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        const data = await res.json();

        document.getElementById('welcomeMessage').classList.add('hidden');
        document.getElementById('displayWrapper').classList.remove('hidden');
        document.getElementById('topicHeading').innerText = data.title;
        document.getElementById('topicDescription').innerText = data.extract;
        
        const img = document.getElementById('topicImg');
        if (data.thumbnail) {
            img.src = data.thumbnail.source;
            img.parentElement.style.display = 'block';
        } else {
            img.parentElement.style.display = 'none';
        }

        status.innerText = "Reading...";
        status.style.background = "#27ae60";
        startReading(data.extract);
    } catch (e) {
        status.innerText = "Error!";
        status.style.background = "#e74c3c";
    }
}

function startReading(text) {
    // Stop any current speaking immediately
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);
    
    // Apply the selected male voice
    if (maleVoice) {
        msg.voice = maleVoice;
    }

    // ROBUST VOICE SETTINGS
    msg.rate = 0.88;    // Slightly slower = clearer and more professional
    msg.pitch = 0.82;   // Lower pitch = deeper, more robust male sound
    msg.volume = 1.0;   // Full volume for a strong output

    // Execute speech
    window.speechSynthesis.speak(msg);

    // Update UI status
    const status = document.getElementById('statusIndicator');
    status.innerText = "Speaking...";
    status.style.background = "#3498db";

    // Detect when it finishes to reset status
    msg.onend = () => {
        status.innerText = "System Ready";
        status.style.background = "#27ae60";
    };
}

function killSpeech() {
    window.speechSynthesis.cancel();
    document.getElementById('statusIndicator').innerText = "System Ready";
    document.getElementById('statusIndicator').style.background = "#27ae60";
}
