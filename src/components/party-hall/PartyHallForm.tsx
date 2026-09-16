"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as addressService from "@/lib/api/address.service";
import type { PartyHallRequest } from "@/types";
import { Textarea } from "../ui/textarea";
import * as orderService from "@/lib/api/order.service";
import { toast } from 'sonner';
interface AddressSetupScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export function PartyHallForm({ onNext, onSkip }: AddressSetupScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PartyHallRequest>({
    defaultValues: {
      contactName: "",
      contactNumber: "",
      reserveDate: "",
      reserveStartTime: "",
      reserveEndTime: "",
      remarks: "",
      alternateContactPerson: "",
      alternateContactNumber: "",
      purpose: "",
    },
  });

  const onSubmit = async (data: PartyHallRequest) => {
    setIsLoading(true);
    setError(null);
    console.log("Form Data:", data); // Log the form data for debugging
    try {
      await orderService.savePartyHallBooking(data);
      toast.success("Party hall booking saved successfully!");
      reset(); 
    } catch (err) {
      console.error("Failed to save party hall booking:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save party hall booking",
      );
    } finally {
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        {/* <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Fill your details to reserve the party hall
        </h2> */}
        <p className="text-gray-600">
          {/* This will help us ensure fast and accurate deliveries */}
          Fill your details to reserve the party hall
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="contactName">Guest Name</Label>
            <Input
              id="contactName"
              placeholder=""
              {...register("contactName", {
                required: "Guest name is required",
              })}
            />
            {errors.contactName && (
              <p className="text-xs text-error">{errors.contactName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              placeholder=""
              {...register("contactNumber", {
                required: "Contact number is required",
              })}
            />
            {errors.contactNumber && (
              <p className="text-xs text-error">
                {errors.contactNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>

            <Select
              value={watch("purpose")}
              onValueChange={(value) => setValue("purpose", value || "")}
              //   label="Purpose"
              //   onChange={(e: SelectChangeEvent) =>
              //     setSelectedDeliveryTime(String(e.target.value))
              //   }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Anniversary">Anniversary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reserveDate">Reservation Date</Label>

            <Input
              type="date"
              id="reserveDate"
              placeholder=""
              {...register("reserveDate", {
                required: "Reservation Date is required",
              })}
            />
            {errors.reserveDate && (
              <p className="text-xs text-error">{errors.reserveDate.message}</p>
            )}
            {/* <Calendar className="w-6 h-6 text-primary" /> */}
            {/* <div className="flex items-center gap-2 text-text-secondary"> */}
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="mt-5 space-y-4">
                <DatePicker
                  label="Delivery Date"
                  // value={watch("reserveDate") ? watch("reserveDate") : ""}
                  onChange={(date) =>
                    setValue(
                      "reserveDate",
                      date ? date.format("YYYY-MM-DD") : "",
                    )
                  }
                  disablePast
                  format="DD/MM/YYYY"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  onError={(reason) => {
                    if (reason === "disablePast") {
                      setDateError("Past dates are not allowed.");
                    } else if (reason === "invalidDate") {
                      setDateError("Please enter a valid date.");
                    } else {
                      setDateError("");
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!dateError,
                      helperText: dateError,
                    },
                  }}
                />
              </div>
            </LocalizationProvider> */}
            {/* <Calendar className="w-4 h-4" /> */}
            {/* <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-SG')}</span> */}
            {/* </div> */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserveStartTime">Reservation Start Time</Label>
            <Input
              id="reserveStartTime"
              type="time"
              {...register("reserveStartTime", { required: false })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reserveEndTime">Reservation End Time</Label>
            <Input
              id="reserveEndTime"
              type="time"
              {...register("reserveEndTime", { required: false })}
            />
          </div>
        </div>

        {/* Row 3: Address Line 1 (full width) */}
        <div className="space-y-2">
          <Label htmlFor="addressLine1">Remarks</Label>
          <Textarea
            id="cancel-reason"
            placeholder="about this booking"
            value={watch("remarks")}
            onChange={(e) => setValue("remarks", e.target.value)} // setValue(e.target.value)}
            className="mt-2"
            rows={4}
          />
          {/* {errors.addressLine1 && (
            <p className="text-xs text-error">{errors.addressLine1.message}</p>
          )} */}
        </div>

        {/* Row 4: Address Line 2 & Delivery Notes */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              placeholder="e.g., Near MRT"
              {...register("addressLine2")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryInstructions">Delivery Notes</Label>
            <Input
              id="deliveryInstructions"
              placeholder="e.g., Leave at door"
              {...register("deliveryInstructions")}
            />
          </div>
        </div> */}

        {/* Row 5: Address Label & Custom Label (side by side) */}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          {/* <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isLoading}
            className="w-full sm:w-1/2"
          >
            Skip for Now
          </Button> */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-1/2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Reserving...</span>
              </div>
            ) : (
              "Reserve Now"
            )}
          </Button>
        </div>
      </form>

      
    </div>
  );
}
