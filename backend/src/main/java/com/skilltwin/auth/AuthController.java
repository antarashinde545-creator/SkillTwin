package com.skilltwin.auth;
import com.skilltwin.user.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
  public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt){this.users=users;this.encoder=encoder;this.jwt=jwt;}
  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest request){
    String email=request.email().trim().toLowerCase();
    if(users.existsByEmailIgnoreCase(email)) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","An account with this email already exists."));
    AppUser user=users.save(new AppUser(request.name().trim(),email,encoder.encode(request.password())));
    return ResponseEntity.status(HttpStatus.CREATED).body(response(user));
  }
  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody AuthDtos.LoginRequest request){
    AppUser user=users.findByEmailIgnoreCase(request.email().trim()).orElse(null);
    if(user==null || !encoder.matches(request.password(),user.getPasswordHash()))
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid email or password."));
    return ResponseEntity.ok(response(user));
  }
  private AuthDtos.AuthResponse response(AppUser user){
    return new AuthDtos.AuthResponse(jwt.generate(user),new AuthDtos.UserResponse(user.getId(),user.getName(),user.getEmail()));
  }
}