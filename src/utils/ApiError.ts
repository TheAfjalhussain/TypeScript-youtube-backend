

class ApiError<T = unknown> extends Error {
  statusCode: number;
  errors: T[]; 
  data: T | null;
  success: false; 

  constructor(
    statusCode: number,
    message: string = "Something went wrong!",
    errors: T[] = [],
    data: T | null = null,
    stack?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };



































// class ApiError extends Error{

//     statusCode: number;
//     message: string
//     errors: any
//     stack: any
//     data: any
//     success: boolean

//     constructor(
//         statusCode: number,
//         message: string = "something went wrong !.",
//         errors: any = [],
//         stack: any = "",
//         data: any
//     ) {
//         super(message)
//         this.statusCode = statusCode,
//         this.message = message,
//         this.errors = errors,
//         this.data = null,
//         this.success = false

//         if (stack) {
//            this.stack = stack
//         }else{
//             Error.captureStackTrace(this, this.constructor)
//         }
//     }

// }

// export { ApiError }