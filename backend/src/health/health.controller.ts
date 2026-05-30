import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "money-keeper-api",
      timestamp: new Date().toISOString(),
    };
  }
}
