import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useState, useEffect } from "react";

function Dashboard() {
  const {state} =useAuthContext()
  const navigate=useNavigate()

    useEffect(() => {
        fetch("/api/meet", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    })
  return (
    <div className="flex flex-col min-h-screen items-center justify-start">
        <div className="w-3/4 mt-5">
            <h1 className="text-5xl text-left">Your Meetings</h1>
        </div>
    </div>
  );
}

export default Dashboard;