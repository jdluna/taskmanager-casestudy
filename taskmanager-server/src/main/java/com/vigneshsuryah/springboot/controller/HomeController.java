/**
 * 
 */
package com.vigneshsuryah.springboot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author vigneshsuryah
 *
 */
@Controller
@RequestMapping("/home")
public class HomeController {
	
	@GetMapping
	public String home() {
		System.out.println("Hello");
		return "forward:/index.html";
	}

}
