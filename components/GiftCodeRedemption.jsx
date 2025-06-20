"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Check, X, Loader2 } from "lucide-react";

export default function GiftCodeRedemption() {
  const [giftCode, setGiftCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleRedeemCode = async () => {
    if (!giftCode.trim()) {
      setMessage("Please enter a gift code");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/redeem-gift-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: giftCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! $${data.amount} has been added to your wallet.`);
        setMessageType("success");
        setGiftCode("");

        // Refresh the page after 2 seconds to show updated balance
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(data.message || "Failed to redeem gift code");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error redeeming gift code:", error);
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRedeemCode();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="h-4 w-4 text-purple-600" />
          Redeem Gift Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gift-code">Enter Gift Code</Label>
          <Input
            id="gift-code"
            type="text"
            placeholder="e.g., GIFT2024"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="font-mono tracking-wider"
            maxLength={12}
          />
        </div>

        <Button
          onClick={handleRedeemCode}
          disabled={isLoading || !giftCode.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Redeeming...
            </>
          ) : (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Redeem Code
            </>
          )}
        </Button>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {messageType === "success" ? (
              <Check className="h-4 w-4 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Gift codes are case-insensitive and
            typically look like GIFT2024, SAVE7891, or BONUS1234.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
