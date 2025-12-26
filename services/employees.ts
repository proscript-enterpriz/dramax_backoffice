'use server';

import * as actions from './api/actions';
import { executeRevalidate } from './api/helpers';
import { RVK_EMPLOYEES } from './rvk';
import {
  BaseResponseListEmployeeResponseType,
  BaseResponseUnionEmployeeResponseNoneTypeType,
  EmployeeCreateType,
  EmployeeUpdateType,
} from './schema';

// Auto-generated service for employees

export type GetEmployeesSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getEmployees(searchParams?: GetEmployeesSearchParams) {
  try {
    const res = await actions.get<BaseResponseListEmployeeResponseType>(
      `/employees`,
      {
        searchParams,
        next: {
          tags: [RVK_EMPLOYEES],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: 'Failed to fetch employees',
      data: [],
    };
  }
}

export async function createEmployee(body: EmployeeCreateType) {
  try {
    const res =
      await actions.post<BaseResponseUnionEmployeeResponseNoneTypeType>(
        `/employees`,
        body,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);
    executeRevalidate([RVK_EMPLOYEES]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: 'Failed to create employee',
      data: null,
    };
  }
}

export async function updateEmployee(
  employeeId: string,
  body: EmployeeUpdateType,
) {
  try {
    const res =
      await actions.put<BaseResponseUnionEmployeeResponseNoneTypeType>(
        `/employees/${employeeId}`,
        body,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);
    executeRevalidate([RVK_EMPLOYEES]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: 'Failed to update employee',
      data: null,
    };
  }
}
