package com.skilltwin.auth;
import com.skilltwin.user.AppUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMs;
  public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) {
    if(secret.getBytes(StandardCharsets.UTF_8).length < 32) throw new IllegalArgumentException("JWT_SECRET must be at least 32 bytes");
    this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expirationMs=expirationMs;
  }
  public String generate(AppUser user) {
    long now=System.currentTimeMillis();
    return Jwts.builder().subject(user.getEmail()).claim("uid",user.getId()).claim("name",user.getName())
      .issuedAt(new Date(now)).expiration(new Date(now+expirationMs)).signWith(key).compact();
  }
  public String extractEmail(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
  }
}