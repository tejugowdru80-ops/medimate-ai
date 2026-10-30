
import { useState, useEffect } from "react";
import {
  Activity, HeartPulse, Mic, Pill, Droplets,
  Camera, LayoutDashboard, Settings, Bell,
  Plus, Menu, X, ArrowRight, Clock,
  CheckCircle, Stethoscope, RotateCcw
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const modules = [
  {
    id: "voice",
    title: "Voice Doctor-Visit Copilot",
    description: "Record symptoms and prepare a summary for your doctor.",
    icon: Mic,
    status: "Coming next"
  },
  {
    id: "prescription",
    title: "Prescription Scanner",
    description: "Upload prescriptions and extract medicine information.",
    icon: Pill,
    status: "Coming next"
  },
  {
    id: "hydration",
    title: "Hydration Tracker",
    description: "Track daily water intake and view your progress.",
    icon: Droplets,
    status: "Connected to database"
  },
  {
    id: "posture",
    title: "Posture Screener",
    description: "Explore posture indicators using your webcam.",
    icon: Camera,
    status: "Coming next"
  }
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [isListening, setIsListening] = useState(false);
const [summary, setSummary] = useState("");
const generateSummary = () => {
  if (!symptoms.trim()) {
    alert("Please enter your symptoms first.");
    return;
  }

  const duration =
    document.getElementById("duration").value || "Not provided";

  const severity =
    document.getElementById("severity").value || "Not provided";

  const medications =
    document.getElementById("medications").value || "Not provided";

  const report = `
================================
       DOCTOR VISIT SUMMARY
================================

1. PATIENT-REPORTED SYMPTOMS

${symptoms}

2. SYMPTOM DURATION

${duration}

3. SYMPTOM SEVERITY

${severity}

4. CURRENT MEDICATIONS AND ALLERGIES

${medications}

5. DISCUSSION WITH DOCTOR

- Discuss the reported symptoms.
- Review current medications.
- Discuss known allergies.
- Ask whether any further evaluation is needed.

--------------------------------
MEDICAL DISCLAIMER

This report organizes information provided
by the user. It does not provide a diagnosis
or replace professional medical advice.
--------------------------------
`;

  setSummary(report);
};
const [symptoms, setSymptoms] = useState("");
const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser. Please use Chrome.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onstart = () => setIsListening(true);

  recognition.onresult = (event) => {
    let spokenText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      spokenText += event.results[i][0].transcript + " ";
    }

    setSymptoms((previous) => previous + spokenText);
  };

  recognition.onerror = () => setIsListening(false);
  recognition.onend = () => setIsListening(false);

  recognition.start();
};

  const [water, setWater] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  // Get saved water intake from the backend
  const loadHydration = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/hydration/today`
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve hydration data");
      }

      const data = await response.json();

      setWater(data.total_ml);
      setApiError("");
    } catch (error) {
      setApiError(
        "Cannot connect to backend. Check whether FastAPI is running."
      );
    }
  };

  // Load water intake when website opens
  useEffect(() => {
    loadHydration();
  }, []);

  // Save water intake in SQLite through FastAPI
  const addWater = async () => {
    setLoading(true);
    setApiError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/hydration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount_ml: 250
        })
      });

      if (!response.ok) {
        throw new Error("Unable to save water intake");
      }

      await response.json();

      await loadHydration();

      setMessage("250 ml water intake saved successfully!");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const goTo = (id) => {
    setPage(id);
    setMenuOpen(false);
    setMessage("");
  };

  const selectedModule = modules.find(
    (item) => item.id === page
  );

  const ModuleIcon = selectedModule?.icon;

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Mobile menu background */}
      {menuOpen && (
        <button
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-5 flex flex-col transition-transform ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 text-white p-3 rounded-xl">
            <HeartPulse size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              MediMate AI
            </h1>
            <p className="text-xs text-slate-500">
              Healthcare Assistant
            </p>
          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-400 mb-3">
          MAIN MENU
        </p>

        <nav className="space-y-2">
          <button
            onClick={() => goTo("dashboard")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
              page === "dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          {modules.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm text-left ${
                  page === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={19} />
                {item.title}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-5">
          <button
            onClick={() => goTo("settings")}
            className="flex items-center gap-3 text-slate-600 p-3 text-sm"
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="mt-4 bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-sm text-blue-900">
              Your health matters
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Organize your wellness information in one place.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-5 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </button>

            <div>
              <h2 className="font-semibold text-slate-900">
                Welcome to MediMate AI
              </h2>
              <p className="text-xs text-slate-500">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-slate-100">
              <Bell size={19} />
            </button>

            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              U
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-7xl mx-auto">

          {/* Dashboard */}
          {page === "dashboard" && (
            <>
              <section className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-7 md:p-10 rounded-3xl mb-8">
                <p className="text-blue-100 text-sm mb-3">
                  YOUR PERSONAL HEALTHCARE COMPANION
                </p>

                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Welcome to MediMate AI
                </h1>

                <p className="text-blue-50 max-w-2xl leading-relaxed">
                  Organize your health information, track daily
                  wellness and prepare for better conversations
                  with your doctor.
                </p>

                <button
                  onClick={() => goTo("voice")}
                  className="mt-6 bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  Get Started <ArrowRight size={18} />
                </button>
              </section>

              <section className="mb-8">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Your Health Modules
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Explore your healthcare tools
                    </p>
                  </div>

                  <Activity className="text-blue-600" />
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {modules.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => goTo(item.id)}
                        className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all"
                      >
                        <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                          <Icon size={24} />
                        </div>

                        <h3 className="font-bold text-slate-900 mb-2">
                          {item.title}
                        </h3>

                        <p className="text-sm text-slate-500 leading-relaxed min-h-16">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-5">
                          <span className="text-xs text-emerald-700 font-semibold">
                            {item.status}
                          </span>
                          <ArrowRight size={18} className="text-blue-600" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid md:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex gap-3 items-center mb-4">
                    <Droplets className="text-cyan-600" />
                    <h3 className="font-bold">Hydration Today</h3>
                  </div>

                  <p className="text-3xl font-bold text-slate-900">
                    {water} ml
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Water intake saved in your database
                  </p>

                  <button
                    onClick={() => goTo("hydration")}
                    className="mt-5 text-blue-700 font-semibold text-sm"
                  >
                    Open hydration tracker →
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex gap-3 items-center mb-4">
                    <Stethoscope className="text-blue-600" />
                    <h3 className="font-bold">
                      Healthcare Information
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    MediMate AI organizes health information.
                    It does not diagnose diseases or replace
                    professional medical advice.
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Module pages */}
          {selectedModule && (
            <section>
              <button
                onClick={() => goTo("dashboard")}
                className="text-blue-700 text-sm mb-6"
              >
                ← Back to dashboard
              </button>

   
<div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
  <div className="flex items-center gap-4 mb-6">
    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl">
      <ModuleIcon size={30} />
    </div>

    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        {selectedModule.title}
      </h1>
      <p className="text-slate-500 text-sm mt-1">
        {selectedModule.description}
      </p>
    </div>
  </div>

  {page === "hydration" ? (
    <div className="max-w-xl">
      <div className="bg-cyan-50 p-6 rounded-2xl mb-6">
        <p className="text-sm text-cyan-800 font-medium">
          Water intake logged today
        </p>
        <p className="text-4xl font-bold text-cyan-900 mt-2">
          {water} ml
        </p>
        <p className="text-xs text-cyan-700 mt-2">
          This records your intake. It is not a prescribed daily water target.
        </p>
      </div>

      <button
        onClick={addWater}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl flex gap-2 items-center hover:bg-blue-700 disabled:opacity-50"
      >
        <Plus size={19} />
        {loading ? "Saving..." : "Add 250 ml water"}
      </button>

      {message && (
        <p className="text-green-700 text-sm mt-3">
          <CheckCircle size={16} className="inline mr-2" />
          {message}
        </p>
      )}

      {apiError && (
        <p className="text-red-600 text-sm mt-3">{apiError}</p>
      )}

      <button
        onClick={loadHydration}
        className="text-sm text-blue-700 underline mt-5 flex gap-2 items-center"
      >
        <RotateCcw size={14} />
        Refresh saved intake
      </button>
    </div>
  ) : page === "voice" ? (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Prepare for your doctor visit
      </h2>

      <p className="text-sm text-slate-600 mb-5">
        Describe your symptoms and organize the information you want to discuss with your doctor.
      </p>

      
      <label className="block font-semibold text-sm mb-2">
        What symptoms are you experiencing?
      </label>

      
<textarea
  value={symptoms}
  onChange={(e) => setSymptoms(e.target.value)}
  className="w-full min-h-36 border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Type your symptoms or use the microphone..."
/>
<div className="mt-5 space-y-4">

  <div>
    <label className="block font-medium mb-2">
      How long have you experienced these symptoms?
    </label>
    <input
      type="text"
      id="duration"
      placeholder="Example: 2 days"
      className="w-full p-3 border rounded-lg"
    />
  </div>

  <div>
    <label className="block font-medium mb-2">
      How severe are your symptoms?
    </label>
    <select
      id="severity"
      className="w-full p-3 border rounded-lg"
    >
      <option value="">Select severity</option>
      <option value="Mild">Mild</option>
      <option value="Moderate">Moderate</option>
      <option value="Severe">Severe</option>
    </select>
  </div>

  <div>
    <label className="block font-medium mb-2">
      Current medications and allergies
    </label>
    <textarea
      id="medications"
      rows={3}
      placeholder="Enter medications and known allergies, or write Not provided."
      className="w-full p-3 border rounded-lg"
    />
  </div>

</div>
<button
  onClick={generateSummary}
  className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Generate Doctor Visit Summary
</button>

{summary && (
  <div className="mt-6">
    <h3 className="text-xl font-semibold mb-3">
      Your Doctor Visit Summary
    </h3>

    <textarea
      value={summary}
      onChange={(e) => setSummary(e.target.value)}
      rows={12}
      className="w-full p-4 border rounded-lg"
    />

    <button
      onClick={() => window.print()}
      className="mt-3 px-5 py-3 bg-green-600 text-white rounded-lg"
    >
      Print Summary / Save as PDF
    </button>
  </div>
)}

<button
  onClick={startVoiceInput}
  className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700"
>
  <Mic size={18} />
  {isListening ? "Listening..." : "Start Voice Input"}
</button>



      <p className="text-xs text-slate-500 mt-3">
        This tool helps organize your information. It does not diagnose medical conditions.
      </p>
    </div>
  ) : (
    <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-2xl text-center">
      <Clock size={35} className="mx-auto text-blue-600 mb-4" />

      <h3 className="font-bold text-slate-900">
        Module development
      </h3>

      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        We will implement and test this module's real functionality in the next development stages.
      </p>

      <div className="mt-4 inline-flex gap-2 items-center text-xs text-emerald-700">
        <CheckCircle size={15} />
        Module navigation is ready
      </div>
    </div>
  )}
</div>
</section>
)}

{/* Settings */}
{page === "settings" && (
  <section className="bg-white p-8 rounded-2xl border border-slate-200">
    <h1 className="text-2xl font-bold">Settings</h1>
    <p className="text-slate-500 mt-2">
      Application preferences will be added here.
    </p>
  </section>
)}

<footer className="text-center text-xs text-slate-400 mt-12 pb-5">
  MediMate AI © 2026 | Your Personal Healthcare & Wellness Assistant
</footer>

</div>
</main>
</div>
);
}

export default App;
