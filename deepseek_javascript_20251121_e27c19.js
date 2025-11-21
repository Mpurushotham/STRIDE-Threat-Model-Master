class ThreatModelerApp {
    constructor() {
        this.phase = 'definition';
        this.activeCategory = null;
        this.threats = this.loadThreats();
        this.init();
    }

    loadThreats() {
        const saved = localStorage.getItem('threatModeler_threats');
        if (saved) {
            return JSON.parse(saved);
        }
        return THREATS.map(t => ({...t}));
    }

    saveThreats() {
        localStorage.setItem('threatModeler_threats', JSON.stringify(this.threats));
    }

    init() {
        this.renderPhaseNavigation();
        this.renderCurrentPhase();
        this.setupEventListeners();
    }

    setPhase(newPhase) {
        this.phase = newPhase;
        this.renderPhaseNavigation();
        this.renderCurrentPhase();
    }

    setActiveCategory(category) {
        this.activeCategory = category;
        this.renderCurrentPhase();
        this.renderDiagram();
    }

    toggleMitigation(threatId) {
        this.threats = this.threats.map(t => 
            t.id === threatId ? { ...t, mitigated: !t.mitigated } : t
        );
        this.saveThreats();
        this.renderCurrentPhase();
        this.renderDiagram();
    }

    renderPhaseNavigation() {
        const phases = ['definition', 'analysis', 'mitigation', 'reporting'];
        const container = document.getElementById('phaseNavigation');
        
        const mitigatedCount = this.threats.filter(t => t.mitigated).length;
        const totalThreats = this.threats.length;
        const securityScore = Math.round((mitigatedCount / totalThreats) * 100);

        container.innerHTML = phases.map((phase, idx) => `
            <button
                onclick="app.setPhase('${phase}')"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${
                    this.phase === phase 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }"
            >
                <span class="w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                    this.phase === phase ? 'bg-white text-blue-600' : 'bg-slate-700'
                }">
                    ${idx + 1}
                </span>
                ${phase}
            </button>
        `).join('') + `
            <div class="ml-auto flex items-center gap-2 px-4 py-1 bg-slate-800 rounded-full border border-slate-700">
                <span class="text-xs text-slate-400">Security Score</span>
                <span class="text-sm font-bold ${
                    securityScore === 100 ? 'text-emerald-400' : securityScore > 50 ? 'text-yellow-400' : 'text-red-400'
                }">
                    ${securityScore}%
                </span>
            </div>
        `;
    }

    renderCurrentPhase() {
        const container = document.getElementById('mainContent');
        const diagramSection = document.getElementById('diagramSection');
        
        // Show/hide diagram based on phase
        diagramSection.style.display = this.phase === 'reporting' ? 'none' : 'block';
        
        switch(this.phase) {
            case 'definition':
                container.innerHTML = this.renderDefinitionPhase();
                break;
            case 'analysis':
                container.innerHTML = this.renderAnalysisPhase();
                this.renderDiagram();
                break;
            case 'mitigation':
                container.innerHTML = this.renderMitigationPhase();
                break;
            case 'reporting':
                container.innerHTML = this.renderReportingPhase();
                break;
        }
    }

    renderDefinitionPhase() {
        return `
            <div class="space-y-6 animate-fadeIn">
                <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 class="text-2xl font-bold text-white mb-4">Vehicle-to-Cloud Telemetry Architecture</h2>
                    <p class="text-slate-300 mb-4 leading-relaxed">
                        This Data Flow Diagram (DFD) represents a standard IoT architecture for a connected vehicle.
                        The Telemetry Control Unit (TCU) collects sensor data (Speed, GPS, Engine Status) and transmits it
                        via a public cellular network (4G/5G) to a Cloud Gateway, which then persists it to a Database.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div class="bg-slate-900 p-4 rounded-lg border border-slate-700 border-l-4 border-l-yellow-500">
                            <h4 class="text-white font-bold mb-1">Vehicle Trust Zone</h4>
                            <p class="text-xs text-slate-400">High trust. Physical access usually required for compromise, but connects to untrusted networks.</p>
                        </div>
                        <div class="bg-slate-900 p-4 rounded-lg border border-slate-700 border-l-4 border-l-red-500">
                            <h4 class="text-white font-bold mb-1">Public Network</h4>
                            <p class="text-xs text-slate-400">Zero trust. Data traverses public infrastructure subject to interception and spoofing.</p>
                        </div>
                        <div class="bg-slate-900 p-4 rounded-lg border border-slate-700 border-l-4 border-l-blue-500">
                            <h4 class="text-white font-bold mb-1">Cloud Trust Zone</h4>
                            <p class="text-xs text-slate-400">Managed trust. Validated inputs only. Strict access controls required.</p>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center">
                    <button onclick="app.setPhase('analysis')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105">
                        Start Threat Analysis &rarr;
                    </button>
                </div>
            </div>
        `;
    }

    renderAnalysisPhase() {
        const activeThreat = this.activeCategory ? 
            this.threats.find(t => t.category === this.activeCategory) || null : null;

        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="col-span-1 space-y-2">
                    <p class="text-sm text-slate-400 mb-2">Select a STRIDE category to analyze:</p>
                    ${Object.values(STRIDE_CATEGORY).map(cat => {
                        const t = this.threats.find(x => x.category === cat);
                        return `
                            <button
                                onclick="app.setActiveCategory('${cat}')"
                                class="w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                    this.activeCategory === cat 
                                        ? 'bg-blue-600/20 border-blue-500 text-white' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                }"
                            >
                                <div class="flex justify-between items-center">
                                    <span class="font-bold">${cat}</span>
                                    <span class="text-xs px-2 py-0.5 rounded ${
                                        t?.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }">
                                        ${t?.impact}
                                    </span>
                                </div>
                                <div class="text-xs mt-1 opacity-70 truncate">${t?.title}</div>
                            </button>
                        `;
                    }).join('')}
                </div>
                <div class="col-span-1 md:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto h-[500px]">
                    ${activeThreat ? this.renderThreatDetails(activeThreat) : `
                        <div class="h-full flex flex-col items-center justify-center text-slate-500">
                            <span class="text-4xl mb-4">🛡️</span>
                            <p>Select a category from the left to analyze threats.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderThreatDetails(threat) {
        return `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-white">${threat.title}</h3>
                    <span class="text-sm font-mono text-slate-500">ID: ${threat.id}</span>
                </div>
                
                <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 class="text-red-400 font-bold text-sm uppercase mb-2">Attack Scenario</h4>
                    <p class="text-slate-200">${threat.context}</p>
                </div>

                <div>
                    <h4 class="text-slate-400 font-bold text-sm uppercase mb-2">Definition</h4>
                    <p class="text-slate-300 text-sm">${threat.definition}</p>
                </div>

                <div class="pt-4 border-t border-slate-700">
                    <h4 class="text-emerald-400 font-bold text-sm uppercase mb-2">Recommended Mitigation</h4>
                    <p class="text-slate-300 text-sm">${threat.mitigation}</p>
                </div>

                <!-- Static AI Advisor Placeholder -->
                <div class="mt-6">
                    <h4 class="text-blue-400 font-bold text-sm uppercase mb-4">Security Advisor</h4>
                    <div class="h-64 bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col justify-center items-center text-center text-slate-400">
                        <span class="text-2xl mb-2">✨</span>
                        <p class="text-sm">AI Security Advisor requires backend integration.</p>
                        <p class="text-xs mt-2">For static deployment, refer to the mitigation guidelines above.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderDiagram() {
        const container = document.getElementById('diagramContainer');
        const activeThreat = this.activeCategory ? 
            this.threats.find(t => t.category === this.activeCategory) || null : null;
        
        const mitigatedThreatIds = this.threats.filter(t => t.mitigated).map(t => t.id);

        // Complex SVG rendering logic would go here
        // This is simplified - full implementation would mirror the React component
        container.innerHTML = `
            <div class="w-full h-80 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative shadow-inner select-none">
                <!-- Legend and SVG content would be generated here -->
                <div class="h-full flex items-center justify-center text-slate-500">
                    <p>Interactive diagram would render here with current threat analysis</p>
                </div>
            </div>
        `;
    }

    // Additional rendering methods for mitigation and reporting phases...
    renderMitigationPhase() {
        const mitigatedCount = this.threats.filter(t => t.mitigated).length;
        const totalThreats = this.threats.length;
        const securityScore = Math.round((mitigatedCount / totalThreats) * 100);

        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <h3 class="text-lg font-bold text-white">Vulnerability Checklist</h3>
                    <p class="text-sm text-slate-400">Review recommendations and apply controls to secure the architecture.</p>
                    <div class="space-y-3 h-[400px] overflow-y-auto pr-2">
                        ${this.threats.map(t => `
                            <div class="p-4 rounded-lg border transition-all ${
                                t.mitigated 
                                    ? 'bg-emerald-900/20 border-emerald-500/50' 
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                            }">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-sm ${
                                                t.mitigated ? 'text-emerald-400' : 'text-white'
                                            }">
                                                ${t.id}: ${t.title}
                                            </span>
                                            ${t.mitigated ? '<span class="text-xs bg-emerald-500 text-slate-900 px-1.5 rounded font-bold">FIXED</span>' : ''}
                                        </div>
                                        <p class="text-xs text-slate-400 mt-1 line-clamp-2">${t.mitigation}</p>
                                    </div>
                                    <button
                                        onclick="app.toggleMitigation('${t.id}')"
                                        class="px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                                            t.mitigated
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                        }"
                                    >
                                        ${t.mitigated ? 'Undo' : 'Apply Fix'}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
                    <h3 class="text-lg font-bold text-white mb-4">Impact Preview</h3>
                    <div class="w-full max-w-xs bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
                        <div 
                            class="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                            style="width: ${securityScore}%"
                        ></div>
                    </div>
                    <p class="text-slate-400 text-sm">
                        System Security Score: <span class="text-white font-bold">${securityScore}/100</span>
                    </p>
                    <div class="mt-8 p-4 bg-slate-800 rounded text-xs text-slate-400 text-left w-full">
                        <strong>Changes applied:</strong>
                        <ul class="list-disc pl-4 mt-2 space-y-1">
                            ${this.threats.filter(t => t.mitigated).map(t => `
                                <li class="text-emerald-400">Applied ${t.mitigation.split('.')[0]}</li>
                            `).join('')}
                            ${this.threats.filter(t => !t.mitigated).length > 0 ? `
                                <li class="text-red-400 italic">
                                    ${this.threats.filter(t => !t.mitigated).length} vulnerabilities remaining.
                                </li>
                            ` : ''}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    renderReportingPhase() {
        const mitigatedCount = this.threats.filter(t => t.mitigated).length;
        const totalThreats = this.threats.length;
        const securityScore = Math.round((mitigatedCount / totalThreats) * 100);

        return `
            <div class="max-w-3xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-2xl">
                <div class="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-800">Threat Model Assessment</h1>
                        <p class="text-slate-500 mt-1">Project: Connected Vehicle Telemetry V1.0</p>
                    </div>
                    <div class="text-right px-4 py-2 rounded-lg ${
                        securityScore === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }">
                        <div class="text-xs font-bold uppercase tracking-wider">Score</div>
                        <div class="text-2xl font-black">${securityScore}%</div>
                    </div>
                </div>

                <div class="space-y-6">
                    <section>
                        <h3 class="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Executive Summary</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">
                            The threat model for the Car Telemetry system identified <strong>${totalThreats}</strong> critical threats across STRIDE categories. 
                            Currently, <strong>${mitigatedCount}</strong> threats have been mitigated through architectural controls.
                            ${securityScore < 100 ? " Immediate attention is required for the remaining vulnerabilities." : " The system architecture meets the baseline security requirements."}
                        </p>
                    </section>

                    <section>
                        <h3 class="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Detailed Findings</h3>
                        <div class="space-y-4">
                            ${this.threats.map(t => `
                                <div class="flex gap-4 text-sm">
                                    <div class="w-16 flex-shrink-0 font-mono font-bold ${
                                        t.mitigated ? 'text-emerald-600' : 'text-red-600'
                                    }">
                                        ${t.id}
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-bold text-slate-700">${t.title}</div>
                                        <div class="text-slate-500 mt-1">
                                            <span class="font-semibold">Mitigation:</span> ${t.mitigation}
                                        </div>
                                    </div>
                                    <div class="w-24 text-right">
                                        ${t.mitigated ? 
                                            '<span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">Resolved</span>' :
                                            '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">Open</span>'
                                        }
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <div class="pt-8 mt-8 border-t border-slate-200 text-center">
                        <button 
                            onclick="window.print()" 
                            class="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-700 transition-colors"
                        >
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the application
const app = new ThreatModelerApp();