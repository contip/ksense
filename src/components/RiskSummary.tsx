import { Patient } from "@/types/patient";
import { RiskAssessment } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Thermometer, Users, AlertCircle } from "lucide-react";

interface RiskSummaryProps {
  patients: Patient[];
  riskAssessments: RiskAssessment[];
}

export default function RiskSummary({
  patients,
  riskAssessments,
}: RiskSummaryProps) {
  const highRiskCount = riskAssessments.filter((r) => r.totalRisk >= 4).length;
  const feverCount = riskAssessments.filter((r) => r.hasFever).length;
  const dataIssuesCount = riskAssessments.filter(
    (r) => r.hasDataQualityIssues
  ).length;
  const totalPatients = patients.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            Risk assessments completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            High Risk Patients
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
          <p className="text-xs text-muted-foreground">
            Risk score ≥ 4 ({((highRiskCount / totalPatients) * 100).toFixed(1)}
            %)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fever Patients</CardTitle>
          <Thermometer className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{feverCount}</div>
          <p className="text-xs text-muted-foreground">
            Temperature ≥ 99.6°F (
            {((feverCount / totalPatients) * 100).toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Data Quality Issues
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {dataIssuesCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Missing/invalid data (
            {((dataIssuesCount / totalPatients) * 100).toFixed(1)}%)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
