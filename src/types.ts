/// <reference path="../types/PowerBI-Visuals-2.6.0.d.ts" />

export interface CardBrowserDocument {
    id: string | number;
    selectionId: powerbi.visuals.ISelectionId;
}

export interface HashMap<T> {
    [key: string]: T;
}

export interface CardBrowserDocumentData {
    documents: HashMap<CardBrowserDocument>;
    documentList: CardBrowserDocument[];
}