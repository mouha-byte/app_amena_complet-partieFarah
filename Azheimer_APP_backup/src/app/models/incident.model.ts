export enum SeverityLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum IncidentStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED'
}

export interface IncidentType {
    id?: number;
    name?: string;
    description?: string;
    defaultSeverity?: string;
    points?: number;
}

export interface IncidentComment {
    id?: number;
    content: string;
    authorId?: number;
    authorName?: string;
    createdAt?: string;
}

export interface Incident {
    id?: number;
    description: string;
    severityLevel: SeverityLevel;
    status: IncidentStatus;
    incidentDate: Date; // string from Backend JSON
    patientId?: number | null;
    caregiverId?: number | null;
    type: IncidentType; // Relation
    deleted?: boolean;
    source?: string;
    computedScore?: number;
}

export interface PatientStats {
    patientId: number;
    patientName: string;
    totalIncidents: number;
    activeIncidents: number;
    resolvedIncidents: number;
    severityScore: number;
    riskLevel: string;
    avgDaysBetween: number;
    bySeverity: { [key: string]: number };
}
