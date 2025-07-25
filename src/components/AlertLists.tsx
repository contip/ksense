import React from "react";
import { Patient } from "@/types/patient";
import { RiskAssessment } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Thermometer, AlertCircle } from "lucide-react";

interface AlertListsProps {
  patients: Patient[];
  riskAssessments: RiskAssessment[];
}

export default function AlertLists({
  patients,
  riskAssessments,
}: AlertListsProps) {
  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.patient_id === patientId)?.name || patientId;
  };

  const highRiskPatients = riskAssessments.filter((r) => r.totalRisk >= 4);
  const feverPatients = riskAssessments.filter((r) => r.hasFever);
  const dataQualityIssues = riskAssessments.filter(
    (r) => r.hasDataQualityIssues
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* High Risk Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            High Risk Patients ({highRiskPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highRiskPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No high-risk patients identified
              </p>
            ) : (
              highRiskPatients.map((risk) => (
                <div
                  key={risk.patient_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {getPatientName(risk.patient_id)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {risk.patient_id}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      BP:{risk.bpRisk} + Temp:{risk.tempRisk} + Age:
                      {risk.ageRisk}
                    </div>
                  </div>
                  <Badge variant="destructive">Risk: {risk.totalRisk}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fever Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Thermometer className="h-5 w-5" />
            Fever Patients ({feverPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feverPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No fever patients identified
              </p>
            ) : (
              feverPatients.map((risk) => {
                const patient = patients.find(
                  (p) => p.patient_id === risk.patient_id
                );
                return (
                  <div
                    key={risk.patient_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {getPatientName(risk.patient_id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {risk.patient_id}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Temperature: {patient?.temperature}°F
                      </div>
                    </div>
                    <Badge variant="secondary">Fever</Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            Data Quality Issues ({dataQualityIssues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataQualityIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No data quality issues identified
              </p>
            ) : (
              dataQualityIssues.map((risk) => {
                const patient = patients.find(
                  (p) => p.patient_id === risk.patient_id
                );
                const issues = [];
                if (risk.bpRisk === -1) issues.push("BP");
                if (risk.tempRisk === -1) issues.push("Temp");
                if (risk.ageRisk === -1) issues.push("Age");

                return (
                  <div
                    key={risk.patient_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {getPatientName(risk.patient_id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {risk.patient_id}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Issues: {issues.join(", ")}
                      </div>
                    </div>
                    <Badge variant="outline">Data Issue</Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
