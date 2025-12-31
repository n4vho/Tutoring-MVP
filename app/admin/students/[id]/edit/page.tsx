"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "../photo-upload";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
  phone: string | null;
  school: string | null;
  grade: string | null;
  status: string;
  photoUrl: string | null;
  batchId: string | null;
};

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    school: "",
    grade: "",
    status: "ACTIVE",
    photoUrl: "",
    batchId: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}`);
        const data = await response.json();

        if (response.ok && data.student) {
          const studentData = data.student;
          setStudent(studentData);
          setFormData({
            fullName: studentData.fullName || "",
            phone: studentData.phone || "",
            school: studentData.school || "",
            grade: studentData.grade || "",
            status: studentData.status || "ACTIVE",
            photoUrl: studentData.photoUrl || "",
            batchId: studentData.batchId || "",
          });
        } else {
          setError(data.error || "Failed to load student data");
        }
      } catch (err) {
        setError("An error occurred while loading student data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Prepare data (remove empty strings for optional fields)
      const submitData: any = {
        fullName: formData.fullName.trim(),
        status: formData.status,
      };

      if (formData.phone.trim()) {
        submitData.phone = formData.phone.trim();
      } else {
        submitData.phone = null;
      }
      if (formData.school.trim()) {
        submitData.school = formData.school.trim();
      } else {
        submitData.school = null;
      }
      if (formData.grade.trim()) {
        submitData.grade = formData.grade.trim();
      } else {
        submitData.grade = null;
      }
      if (formData.photoUrl.trim()) {
        submitData.photoUrl = formData.photoUrl.trim();
      } else {
        submitData.photoUrl = null;
      }
      if (formData.batchId.trim()) {
        submitData.batchId = formData.batchId.trim();
      } else {
        submitData.batchId = null;
      }

      const response = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect back to detail page
        router.push(`/admin/students/${studentId}?success=Student updated successfully`);
      } else {
        setError(data.error || "Failed to update student");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Student</h1>
          <Link href="/admin/students">
            <Button variant="outline">Back to Students</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              {error || "Student not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/students/${studentId}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Student Details
          </Link>
          <h1 className="text-3xl font-bold">Edit Student</h1>
        </div>
        <Link href={`/admin/students/${studentId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <PhotoUpload
            studentId={studentId}
            currentPhotoUrl={formData.photoUrl || null}
            onPhotoUpdate={(photoUrl) => {
              setFormData((prev) => ({ ...prev, photoUrl: photoUrl || "" }));
            }}
          />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Student Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="registrationNo"
                className="block text-sm font-medium mb-1"
              >
                Registration Number
              </label>
              <Input
                id="registrationNo"
                name="registrationNo"
                type="text"
                value={student.registrationNo}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Registration number cannot be changed
              </p>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium mb-1"
              >
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium mb-1">
                School
              </label>
              <Input
                id="school"
                name="school"
                type="text"
                value={formData.school}
                onChange={handleChange}
                placeholder="Enter school name"
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium mb-1">
                Grade
              </label>
              <Input
                id="grade"
                name="grade"
                type="text"
                value={formData.grade}
                onChange={handleChange}
                placeholder="Enter grade"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="GRADUATED">GRADUATED</option>
                <option value="DROPPED">DROPPED</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="batchId"
                className="block text-sm font-medium mb-1"
              >
                Batch ID (optional)
              </label>
              <Input
                id="batchId"
                name="batchId"
                type="text"
                value={formData.batchId}
                onChange={handleChange}
                placeholder="Enter batch ID"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Link href={`/admin/students/${studentId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
