export interface UserMarker {
    id: string;
    position: [number, number];
    title: string;
}

export interface POI {
    id: number;
    name: string;
    address: string;
    category: string;
    coordinates: [number, number]; // [lng, lat]
    reviews?: string[];
    score: number;
    predicted_rating: number;
    model_confidence: number;
    review_count: number;
}

export interface RouteSegment {
    path: [number, number][];
    color: string;
}

export interface RouteData {
    points: [number, number][]; // POI markers
    segments: RouteSegment[];
    pois: POI[];
    totalDistance: number; // in meters
    segmentDistances?: number[];
    isReturnBack?: boolean;
    activeSegmentIndex?: number | null;
}