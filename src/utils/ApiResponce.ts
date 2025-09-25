
class ApiResponse  {
  statusCode: number;
  message: any;
  data: any;
  success: boolean;

  constructor(statusCode: number, message: any = "success", data: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400; 
  }
}

export { ApiResponse };
