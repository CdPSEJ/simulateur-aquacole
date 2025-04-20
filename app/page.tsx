import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function RentabiliteAquaSim() {
  const [params, setParams] = useState({
    nbBassins: 4,
    poissonsParBassin: 5000,
    tauxSurvie: 90,
    poidsMoyen: 350,
    prixVenteKg: 1200,
    fcr: 1.8,
    prixAlimentKg: 650,
    autresCharges: 3000000,
    cycles: 3
  });

  const updateParam = (key, value) => {
    setParams({ ...params, [key]: value });
  };

  const calculerCycle = () => {
    const cycleData = [];
    for (let i = 1; i <= params.cycles; i++) {
      const biomasse = (params.nbBassins * params.poissonsParBassin * (params.tauxSurvie / 100) * params.poidsMoyen) / 1000;
      const revenu = biomasse * params.prixVenteKg;
      const coutAlim = biomasse * params.fcr * params.prixAlimentKg;
      const cout = coutAlim + params.autresCharges;
      const resultat = revenu - cout;
      cycleData.push({
        cycle: `Cycle ${i}`,
        revenu,
        cout,
        resultat
      });
    }
    return cycleData;
  };

  const cycleResults = calculerCycle();
  const totalBiomasse = cycleResults.length * ((params.nbBassins * params.poissonsParBassin * (params.tauxSurvie / 100) * params.poidsMoyen) / 1000);
  const totalRevenu = cycleResults.reduce((sum, c) => sum + c.revenu, 0);
  const totalCout = cycleResults.reduce((sum, c) => sum + c.cout, 0);
  const totalResultat = totalRevenu - totalCout;

  const exporterCSV = () => {
    const header = "Cycle,Revenu,Cout,Resultat\n";
    const rows = cycleResults.map(c => `${c.cycle},${c.revenu},${c.cout},${c.resultat}`).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultats_cycles.csv";
    a.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Simulateur de rentabilité - Ferme Aquacole</h1>

      <Card>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {Object.entries({
            nbBassins: "Nombre de bassins",
            poissonsParBassin: "Poissons par bassin",
            tauxSurvie: "Taux de survie (%)",
            poidsMoyen: "Poids moyen à la récolte (g)",
            prixVenteKg: "Prix de vente (FCFA/kg)",
            fcr: "FCR (indice de conversion)",
            prixAlimentKg: "Prix aliment (FCFA/kg)",
            autresCharges: "Autres charges (FCFA)",
            cycles: "Nombre de cycles"
          }).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                type="number"
                value={params[key]}
                onChange={(e) => updateParam(key, Number(e.target.value))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">Résultats cumulés ({params.cycles} cycles)</h2>
          <p>Biomasse totale : <strong>{totalBiomasse.toFixed(0)} kg</strong></p>
          <p>Revenu total : <strong>{totalRevenu.toLocaleString()} FCFA</strong></p>
          <p>Coût total : <strong>{totalCout.toLocaleString()} FCFA</strong></p>
          <p>Résultat net : <strong>{totalResultat.toLocaleString()} FCFA</strong></p>
          <p>Coût de production par kg : <strong>{(totalCout / totalBiomasse).toFixed(0)} FCFA/kg</strong></p>
          <p>Marge nette par kg : <strong>{(totalResultat / totalBiomasse).toFixed(0)} FCFA/kg</strong></p>
          <Button className="mt-4" onClick={exporterCSV}>Exporter les résultats (.csv)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Évolution des résultats par cycle</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cycleResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenu" stroke="#10b981" name="Revenu" />
              <Line type="monotone" dataKey="cout" stroke="#ef4444" name="Coût" />
              <Line type="monotone" dataKey="resultat" stroke="#3b82f6" name="Résultat net" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}