package com.skilltwin.auth;
import jakarta.validation.constraints.*;
public class AuthDtos {
  public record RegisterRequest(@NotBlank @Size(min=2,max=100) String name,
    @NotBlank @Email @Size(max=190) String email,
    @NotBlank @Size(min=8,max=72) String password) {}
  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record UserResponse(Long id, String name, String email) {}
  public record AuthResponse(String token, UserResponse user) {}
}