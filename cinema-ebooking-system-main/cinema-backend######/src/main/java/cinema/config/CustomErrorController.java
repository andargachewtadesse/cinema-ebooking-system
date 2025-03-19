package cinema.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<String> handleError(HttpServletRequest request) {
        // Get the actual error attributes
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object requestUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        System.out.println("Error details:");
        System.out.println("Status code: " + statusCode);
        System.out.println("Exception: " + (exception != null ? exception.toString() : "null"));
        System.out.println("Message: " + message);
        System.out.println("Request URI: " + requestUri);
        
        String errorMessage = String.format("Error occurred: status=%s, uri=%s, message=%s, exception=%s", 
            statusCode, 
            requestUri,
            message,
            exception != null ? exception.toString() : "Unknown error");
            
        return new ResponseEntity<>(errorMessage, 
            statusCode != null ? HttpStatus.valueOf(Integer.parseInt(statusCode.toString())) : HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 