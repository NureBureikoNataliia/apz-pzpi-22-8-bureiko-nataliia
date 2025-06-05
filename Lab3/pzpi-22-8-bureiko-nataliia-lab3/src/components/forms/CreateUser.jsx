import { useState } from "react";
import { createEmployee } from "../../services/api";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateUser() {
  const [user, setUser] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "", // administrator or consultant
  });

  const [allowedEmails, setAllowedEmails] = useState([]);
  const [isEmailsLoaded, setIsEmailsLoaded] = useState(false);

  // Load allowed emails from Excel file
  async function loadAllowedEmails() {
    try {
      const response = await fetch("/employees.xlsx");
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const emails = jsonData
        .map(
          (row) => row.email || row.Email || row.EMAIL || Object.values(row)[0]
        )
        .filter((email) => email && email.includes("@"));

      setAllowedEmails(emails.map((email) => email.toLowerCase().trim()));
      setIsEmailsLoaded(true);
    } catch (error) {
      console.error("Error loading Excel:", error);
      alert("Error loading allowed emails from Excel file");
    }
  }

  // Load emails when component mounts
  useState(() => {
    loadAllowedEmails();
  }, []);

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  function validateForm() {
    // Check if passwords match
    if (user.password !== user.confirmPassword) {
      alert("Passwords do not match");
      return false;
    }

    // Check if email is in allowed list
    if (!allowedEmails.includes(user.email.toLowerCase().trim())) {
      alert("This email is not authorized for registration");
      return false;
    }

    // Check if position is selected
    if (!user.position) {
      alert("Please select your position");
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isEmailsLoaded) {
      alert("Please wait while allowed emails are being loaded");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Prepare user data for API
    const userData = {
      firstName: user.firstName,
      surname: user.surname,
      email: user.email,
      password: user.password,
      admin: user.position === "administrator", // true if administrator, false if consultant
    };

    try {
      let response = await createEmployee(userData);
      console.log(response);

      if (response.data.message) {
        alert("Employee account could not be created :(");
      } else {
        alert("Employee account created successfully!");
        // Reset form
        setUser({
          firstName: "",
          surname: "",
          email: "",
          password: "",
          confirmPassword: "",
          position: "",
        });
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Error creating employee account");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <Input
        placeholder="First name"
        onChange={handleChange}
        name="firstName"
        value={user.firstName}
        required
        maxLength={20}
        className="mb-4"
      />

      <Input
        placeholder="Surname"
        onChange={handleChange}
        name="surname"
        value={user.surname}
        required
        maxLength={20}
        className="mb-4"
      />

      <Input
        placeholder="Email"
        onChange={handleChange}
        name="email"
        value={user.email}
        type="email"
        required
        maxLength={50}
        className="mb-4"
      />

      <Input
        placeholder="Password"
        onChange={handleChange}
        name="password"
        value={user.password}
        type="password"
        required
        maxLength={8}
        className="mb-4"
      />

      <Input
        placeholder="Confirm Password"
        onChange={handleChange}
        name="confirmPassword"
        value={user.confirmPassword}
        type="password"
        required
        maxLength={8}
        className="mb-4"
      />

      <Select
        name="position"
        value={user.position}
        onChange={handleChange}
        required
      >
        <SelectTrigger className="w-[385px] mb-4">
          <SelectValue placeholder="Select Position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="administrator">Administrator</SelectItem>
          <SelectItem value="consultant">Consultant</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" disabled={!isEmailsLoaded} className="mb-4">
        {isEmailsLoaded ? "Create Account" : "Loading..."}
      </Button>
    </form>
  );
}
