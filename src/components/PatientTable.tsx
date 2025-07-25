"use client";

import React, { useState, useMemo } from "react";
import { Patient } from "@/types/patient";
import { RiskAssessment } from "@/lib/api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Thermometer,
  User,
  Search,
  ArrowUpDown,
} from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  riskAssessments: RiskAssessment[];
}

type SortField =
  | "name"
  | "age"
  | "totalRisk"
  | "temperature"
  | "blood_pressure";
type SortDirection = "asc" | "desc";

export default function PatientTable({
  patients,
  riskAssessments,
}: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("totalRisk");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getRiskBadgeColor = (risk: number) => {
    if (risk >= 6) return "destructive";
    if (risk >= 4) return "destructive";
    if (risk >= 2) return "secondary";
    return "outline";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 6) return "Critical";
    if (risk >= 4) return "High";
    if (risk >= 2) return "Medium";
    return "Low";
  };

  const combinedData = useMemo(() => {
    return patients.map((patient) => {
      const risk = riskAssessments.find(
        (r) => r.patient_id === patient.patient_id
      );
      return { ...patient, risk: risk || null };
    });
  }, [patients, riskAssessments]);

  const filteredAndSortedData = useMemo(() => {
    const filtered = combinedData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patient_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRiskFilter =
        riskFilter === "all" ||
        (riskFilter === "high" && item.risk && item.risk.totalRisk >= 4) ||
        (riskFilter === "fever" && item.risk && item.risk.hasFever) ||
        (riskFilter === "issues" &&
          item.risk &&
          item.risk.hasDataQualityIssues);

      return matchesSearch && matchesRiskFilter;
    });

    // Sort the data
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "age":
          aValue = typeof a.age === "number" ? a.age : 0;
          bValue = typeof b.age === "number" ? b.age : 0;
          break;
        case "totalRisk":
          aValue = a.risk?.totalRisk || 0;
          bValue = b.risk?.totalRisk || 0;
          break;
        case "temperature":
          aValue = typeof a.temperature === "number" ? a.temperature : 0;
          bValue = typeof b.temperature === "number" ? b.temperature : 0;
          break;
        case "blood_pressure":
          aValue = a.blood_pressure;
          bValue = b.blood_pressure;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [combinedData, searchTerm, riskFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Patient Risk Assessment Data
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="high">High Risk (≥4)</SelectItem>
              <SelectItem value="fever">Fever Patients</SelectItem>
              <SelectItem value="issues">Data Issues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold"
                  >
                    Patient
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("age")}
                    className="h-auto p-0 font-semibold"
                  >
                    Age
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("blood_pressure")}
                    className="h-auto p-0 font-semibold"
                  >
                    Blood Pressure
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("temperature")}
                    className="h-auto p-0 font-semibold"
                  >
                    Temperature
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Risk Breakdown</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("totalRisk")}
                    className="h-auto p-0 font-semibold"
                  >
                    Total Risk
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Alerts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((patient) => (
                <TableRow key={patient.patient_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.patient_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.blood_pressure || "N/A"}</TableCell>
                  <TableCell>
                    {typeof patient.temperature === "number"
                      ? `${patient.temperature}°F`
                      : patient.temperature}
                  </TableCell>
                  <TableCell>
                    {patient.risk ? (
                      <div className="text-sm">
                        <div>
                          BP:{" "}
                          {patient.risk.bpRisk >= 0
                            ? patient.risk.bpRisk
                            : "Invalid"}
                        </div>
                        <div>
                          Temp:{" "}
                          {patient.risk.tempRisk >= 0
                            ? patient.risk.tempRisk
                            : "Invalid"}
                        </div>
                        <div>
                          Age:{" "}
                          {patient.risk.ageRisk >= 0
                            ? patient.risk.ageRisk
                            : "Invalid"}
                        </div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.risk && (
                      <Badge
                        variant={getRiskBadgeColor(patient.risk.totalRisk)}
                      >
                        {patient.risk.totalRisk} -{" "}
                        {getRiskLabel(patient.risk.totalRisk)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(patient.risk?.totalRisk || 0) >= 4 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {patient.risk?.hasFever && (
                        <Thermometer className="h-4 w-4 text-orange-500" />
                      )}
                      {patient.risk?.hasDataQualityIssues && (
                        <div
                          className="h-4 w-4 rounded-full bg-yellow-500"
                          title="Data Issues"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedData.length} of {patients.length} patients
        </div>
      </CardContent>
    </Card>
  );
}
