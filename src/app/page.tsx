"use client";

import { useCallback, useState } from "react";
import ApiKeyInput from "@/components/ApiKeyInput";
import PatientTable from "@/components/PatientTable";
import AlertLists from "@/components/AlertLists";
import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@/types/patient";
import { AssessmentResponse, RiskAssessment } from "@/lib/api/types";
import { ApiClient } from "@/lib/api/client";
import { calculateRiskAssessment } from "@/lib/riskCalculator";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RiskSummary from "@/components/RiskSummary";

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] =
    useState<AssessmentResponse | null>(null);

  const fetchData = useCallback(async () => {
    if (!apiKey) {
      return;
    }
    setIsLoading(true);
    setError("");
    setProgress(0);

    try {
      const client = new ApiClient(apiKey);
      const fetchedPatients = await client.fetchAllPatients((progress) => {
        setProgress(progress);
      });
      setPatients(fetchedPatients);
      const assessments = fetchedPatients.map(calculateRiskAssessment);
      setRiskAssessments(assessments);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const handleSubmitAssessment = async () => {
    if (!apiKey || riskAssessments.length === 0) return;

    setIsSubmitting(true);
    setError("");

    try {
      const client = new ApiClient(apiKey);

      const results = {
        high_risk_patients: riskAssessments
          .filter((r) => r.totalRisk >= 4)
          .map((r) => r.patient_id),
        fever_patients: riskAssessments
          .filter((r) => r.hasFever)
          .map((r) => r.patient_id),
        data_quality_issues: riskAssessments
          .filter((r) => r.hasDataQualityIssues)
          .map((r) => r.patient_id),
      };

      const result = await client.submitAssessment(results);
      setSubmissionResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit assessment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">
        Ksense Healthcare Risk Assessment System
      </h1>
      {!isAuthenticated ? (
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardTitle className="text-2xl px-6 pt-6">Enter API Key</CardTitle>
            <CardDescription className="px-6">
              Use your secure key to connect to the API endpoint
            </CardDescription>
            <CardContent>
              <ApiKeyInput
                onApiKeySubmit={(key) => {
                  setApiKey(key);
                  setIsAuthenticated(true);
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {patients.length === 0 && !isLoading && (
            <Card className="p-6 w-full max-w-sm">
              <CardTitle className="text-2xl px-4">
                Ready to Fetch Patient Data
              </CardTitle>
              <CardDescription className="px-4">
                Click below to retrieve all patient records and calculate risk
                scores
              </CardDescription>
              <CardContent>
                <Button type="button" variant="outline" onClick={fetchData}>
                  Fetch Patient Data
                </Button>
              </CardContent>
            </Card>
          )}
          {isLoading && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <h3 className="text-lg font-semibold">
                  Fetching Patient Data...
                </h3>
                <Progress
                  value={progress}
                  className="w-full max-w-md mx-auto"
                />
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>
            </Card>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {submissionResult && (
            <Alert
              variant={submissionResult.success ? "default" : "destructive"}
            >
              <AlertDescription>
                <div className="space-y-4">
                  {/* Main Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <strong>Score:</strong> {submissionResult.results.score}
                      /100
                    </div>
                    <div>
                      <strong>Status:</strong> {submissionResult.results.status}
                    </div>
                    <div>
                      <strong>Attempts Remaining:</strong>{" "}
                      {submissionResult.results.remaining_attempts}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {submissionResult.results.breakdown && (
                    <div>
                      <strong>Score Breakdown:</strong>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          High Risk:{" "}
                          {submissionResult.results.breakdown.high_risk
                            ?.score || 0}
                          /
                          {submissionResult.results.breakdown.high_risk?.max ||
                            0}{" "}
                          (Correct:{" "}
                          {submissionResult.results.breakdown.high_risk
                            ?.correct || 0}
                          , Submitted:{" "}
                          {submissionResult.results.breakdown.high_risk
                            ?.submitted || 0}
                          )
                        </div>
                        <div>
                          Fever:{" "}
                          {submissionResult.results.breakdown.fever?.score || 0}
                          /{submissionResult.results.breakdown.fever?.max || 0}{" "}
                          (Correct:{" "}
                          {submissionResult.results.breakdown.fever?.correct ||
                            0}
                          , Submitted:{" "}
                          {submissionResult.results.breakdown.fever
                            ?.submitted || 0}
                          )
                        </div>
                        <div>
                          Data Quality:{" "}
                          {submissionResult.results.breakdown.data_quality
                            ?.score || 0}
                          /
                          {submissionResult.results.breakdown.data_quality
                            ?.max || 0}{" "}
                          (Correct:{" "}
                          {submissionResult.results.breakdown.data_quality
                            ?.correct || 0}
                          , Submitted:{" "}
                          {submissionResult.results.breakdown.data_quality
                            ?.submitted || 0}
                          )
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {submissionResult.results.feedback && (
                    <div>
                      {submissionResult.results.feedback.strengths &&
                        submissionResult.results.feedback.strengths.length >
                          0 && (
                          <div className="mb-2">
                            <strong className="text-green-700">
                              Strengths:
                            </strong>
                            <ul className="text-sm mt-1 space-y-1">
                              {submissionResult.results.feedback.strengths.map(
                                (strength, idx) => (
                                  <li key={idx}>• {strength}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {submissionResult.results.feedback.issues &&
                        submissionResult.results.feedback.issues.length > 0 && (
                          <div>
                            <strong className="text-amber-700">Issues:</strong>
                            <ul className="text-sm mt-1 space-y-1">
                              {submissionResult.results.feedback.issues.map(
                                (issue, idx) => (
                                  <li key={idx}>• {issue}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="text-sm text-muted-foreground border-t pt-2">
                    <div>
                      Attempt:{" "}
                      {submissionResult.results.attempt_number || "N/A"}
                    </div>
                    <div>
                      Personal Best:{" "}
                      {submissionResult.results.is_personal_best ? "Yes" : "No"}
                    </div>
                    <div>
                      Can Resubmit:{" "}
                      {submissionResult.results.can_resubmit ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          {patients.length > 0 && (
            <>
              {/* Risk Summary Cards */}
              <RiskSummary
                patients={patients}
                riskAssessments={riskAssessments}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-start sm:items-center">
                <div className="flex gap-2">
                  <Button
                    onClick={fetchData}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Refresh Data
                  </Button>
                </div>

                <Button
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting || riskAssessments.length === 0}
                  size="lg"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Submit Assessment
                </Button>
              </div>

              {/* Tabbed Interface */}
              <Tabs defaultValue="patients" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patients">
                    Patient Data ({patients.length})
                  </TabsTrigger>
                  <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="patients" className="mt-6">
                  <PatientTable
                    patients={patients}
                    riskAssessments={riskAssessments}
                  />
                </TabsContent>

                <TabsContent value="alerts" className="mt-6">
                  <AlertLists
                    patients={patients}
                    riskAssessments={riskAssessments}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      )}
    </main>
  );
}
