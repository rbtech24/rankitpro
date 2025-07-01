import React from "react";
import { Link } from "wouter";
import { Button } from "ui/button";

const ROICalculatorSimple = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">ROI Calculator</h1>
        <p className="text-xl text-center mb-8">This is a test version of the ROI calculator.</p>
        <div className="text-center">
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ROICalculatorSimple;