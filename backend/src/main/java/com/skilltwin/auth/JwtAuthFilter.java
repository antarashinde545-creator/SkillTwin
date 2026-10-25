package com.skilltwin.auth;
import com.skilltwin.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService; private final UserRepository users;
  public JwtAuthFilter(JwtService jwtService, UserRepository users){this.jwtService=jwtService;this.users=users;}
  @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    String header=request.getHeader("Authorization");
    if(header!=null && header.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication()==null){
      try{
        String email=jwtService.extractEmail(header.substring(7));
        users.findByEmailIgnoreCase(email).ifPresent(u->{
          var principal=User.withUsername(u.getEmail()).password(u.getPasswordHash()).authorities(List.of()).build();
          var auth=new UsernamePasswordAuthenticationToken(principal,null,principal.getAuthorities());
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(auth);
        });
      }catch(Exception ignored){ SecurityContextHolder.clearContext(); }
    }
    chain.doFilter(request,response);
  }
}