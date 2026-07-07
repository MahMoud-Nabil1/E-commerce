package com.ecommerce.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private static final Logger logger = LoggerFactory.getLogger(MailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Override
    public void sendMail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Successfully sent email to {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {} via SMTP. Error: {}", to, e.getMessage());
            logger.warn("FALLBACK LOG: Subject: '{}' | Body snippet: '{}'", subject, body.replace("\n", " "));
        }
    }
}
