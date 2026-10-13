// Site-wide facts. Operator details for imprint and privacy notice are still open: until they are
// filled in, those pages show a marked placeholder.
export const site = {
  name: 'Saubera',
  claim: 'Das B2B-Portal für Gebäude- und Objektreinigung',
  description:
    'Saubera verbindet Unternehmen mit geprüften Reinigungsfirmen: vergleichbare Angebote über ein strukturiertes Leistungsverzeichnis und Betreuung auch nach der Vermittlung. Für Auftraggeber kostenlos.',
  operator: null as null | { name: string; street: string; city: string; email: string; phone?: string; register?: string; vatId?: string; represented?: string },
};
