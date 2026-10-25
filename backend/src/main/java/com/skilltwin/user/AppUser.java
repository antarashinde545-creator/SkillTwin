package com.skilltwin.user;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="users", uniqueConstraints=@UniqueConstraint(name="uk_users_email", columnNames="email"))
public class AppUser {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, length=100) private String name;
  @Column(nullable=false, unique=true, length=190) private String email;
  @Column(nullable=false, name="password_hash", length=100) private String passwordHash;
  @Column(nullable=false, name="created_at", updatable=false) private Instant createdAt;
  protected AppUser() {}
  public AppUser(String name, String email, String passwordHash) { this.name=name; this.email=email; this.passwordHash=passwordHash; this.createdAt=Instant.now(); }
  @PrePersist void prePersist(){ if(createdAt==null) createdAt=Instant.now(); }
  public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;}
  public String getPasswordHash(){return passwordHash;} public Instant getCreatedAt(){return createdAt;}
}