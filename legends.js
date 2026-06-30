export const dcaClassLegend = [
    {value: 1, label: "Insects", color: "#4d9611ff"},
    {value: 2, label: "Disease & parasitism", color: "#703b8fff"},
    {value: 3, label: "Fire", color: "#ff0000ff"},
    {value: 4, label: "Wild animals", color: "#481f00ff"},
    {value: 5, label: "Abiotic", color: "#15dcffff"},
    // 6XXXX is multi-agent complexes that are apparently unused
    // in western states.
    {value: 7, label: "Anthropogenic", color: "#debb48ff"},
    {value: 8, label: "Invasive plants", color: "#194431ff"},
    {value: 9, label: "Uncategorized", color: "#2f2d2dff"},
]

export function dcaFillColorPaint() {
    return [
        "match",
        ["floor", ["/", ["to-number", ["get", "DCA_CODE"]], 10000]],
        ...dcaClassLegend.flatMap((entry) => [entry.value, entry.color]),
        "#000000"
    ];
}