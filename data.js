// Constants and data
const STRIDE_CATEGORY = {
    S: "Spoofing",
    T: "Tampering", 
    R: "Repudiation",
    I: "Information Disclosure",
    D: "Denial of Service",
    E: "Elevation of Privilege"
};

const THREATS = [
    {
        id: 'S-1',
        category: STRIDE_CATEGORY.S,
        title: "TCU Identity Spoofing",
        definition: "An attacker masquerades as a legitimate vehicle to inject false telemetry.",
        context: "A rogue device uses a cloned VIN (Vehicle Identification Number) to connect to the Cloud Gateway. If successful, it sends fake 'Crash Detected' alerts.",
        mitigation: "Implement Mutual TLS (mTLS). Provision each TCU with a unique X.509 certificate stored in a Hardware Security Module (HSM).",
        affectedComponents: ['attacker', 'cloud-gateway'],
        mitigated: false,
        impact: 'High'
    },
    // ... include all other threats from your original data.js
];

const DIAGRAM_NODES = [
    { id: 'car-tcu', label: 'Car TCU', x: 100, y: 150, type: 'actor', trustZone: 'car' },
    { id: 'network', label: 'Cellular (4G/5G)', x: 300, y: 150, type: 'external', trustZone: 'public' },
    { id: 'attacker', label: 'Attacker', x: 300, y: 260, type: 'attacker', trustZone: 'public' },
    { id: 'cloud-gateway', label: 'IoT Gateway', x: 500, y: 150, type: 'process', trustZone: 'cloud' },
    { id: 'db', label: 'Telemetry DB', x: 700, y: 150, type: 'datastore', trustZone: 'cloud' },
];

const DIAGRAM_LINKS = [
    { source: 'car-tcu', target: 'network', label: 'MQTT' },
    { source: 'network', target: 'cloud-gateway', label: 'Ingress' },
    { source: 'cloud-gateway', target: 'db', label: 'Write' },
    { source: 'attacker', target: 'network', label: 'Intercept' }
];
