import { Request, Response } from "express";
import ApiResponse from "../utils/api-responses.utils";
import { Appointment } from "../schemas";
import { appointmentService } from "../services";
import { AuthenticatedRequest } from "../types";

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const { userId, role } = (req as AuthenticatedRequest).user;
        const appointments: Appointment[] = await appointmentService.getAll(userId, role);
        return ApiResponse.success(res, appointments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const appointmentId: string | undefined = req.params.appointmentId;
        if (appointmentId === undefined || appointmentId === null) {
            return ApiResponse.badRequest(res, "Appointment ID is required");
        }

        const { userId, role } = (req as AuthenticatedRequest).user;
        const appointment: Appointment = await appointmentService.getById(Number(appointmentId), userId, role);
        return ApiResponse.success(res, appointment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentsByUserId = async (req: Request, res: Response) => {
    try {
        const userId: string | undefined = req.params.userId;
        if (userId === undefined || userId === null) {
            return ApiResponse.badRequest(res, "User ID is required");
        }

        const appointments: Appointment[] = await appointmentService.getByUserId(Number(userId));
        return ApiResponse.success(res, appointments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentsByAnimalId = async (req: Request, res: Response) => {
    try {
        const animalId: string | undefined = req.params.animalId;
        if (animalId === undefined || animalId === null) {
            return ApiResponse.badRequest(res, "Animal ID is required");
        }

        const appointments: Appointment[] = await appointmentService.getByAnimalId(Number(animalId));
        return ApiResponse.success(res, appointments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentsByClinicId = async (req: Request, res: Response) => {
    try {
        const clinicId: string | undefined = req.params.clinicId;
        if (clinicId === undefined || clinicId === null) {
            return ApiResponse.badRequest(res, "Clinic ID is required");
        }

        const appointments: Appointment[] = await appointmentService.getByClinicId(Number(clinicId));
        return ApiResponse.success(res, appointments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const getAppointmentsByReasonId = async (req: Request, res: Response) => {
    try {
        const reasonId: string | undefined = req.params.reasonId;
        if (reasonId === undefined || reasonId === null) {
            return ApiResponse.badRequest(res, "Reason ID is required");
        }

        const appointments: Appointment[] = await appointmentService.getByReasonId(Number(reasonId));
        return ApiResponse.success(res, appointments);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const appointment: Appointment = await appointmentService.create(req.body);
        return ApiResponse.success(res, appointment, 201);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId: string | undefined = req.params.appointmentId;
        if (appointmentId === undefined || appointmentId === null) {
            return ApiResponse.badRequest(res, "Appointment ID is required");
        }

        const appointment: Appointment = await appointmentService.update(Number(appointmentId), req.body);
        return ApiResponse.success(res, appointment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const toggleAppointmentIsCompleted = async (req: Request, res: Response) => {
    try {
        const appointmentId: string | undefined = req.params.appointmentId;
        const isCompleted: boolean = req.body.isCompleted;
        if (appointmentId === undefined || appointmentId === null || isCompleted === undefined || isCompleted == null) {
            return ApiResponse.badRequest(res, "Appointment ID and isCompleted are required");
        }

        const appointment: Appointment = await appointmentService.setIsCompleted(Number(appointmentId), isCompleted);
        return ApiResponse.success(res, appointment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId: string | undefined = req.params.appointmentId;
        if (appointmentId === undefined || appointmentId === null) {
            return ApiResponse.badRequest(res, "Appointment ID is required");
        }

        const appointment: Appointment = await appointmentService.delete(Number(appointmentId));
        return ApiResponse.success(res, appointment);
    } catch (error) {
        return ApiResponse.getError(res, error);
    }
};
