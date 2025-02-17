import axios from "axios";
import { config } from "~/common/config";

export const API_BASE = config.apiBaseUrl;

export const instance = axios.create({
  baseURL: API_BASE,
  timeout: 60000
});
