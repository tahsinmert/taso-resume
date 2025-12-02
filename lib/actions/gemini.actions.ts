"use server";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

async function askLlama(prompt: string) {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 1,
          top_p: 0.95,
          top_k: 64,
        },
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ollama'dan gelen response'u parse et
    let responseText = data.response || "";
    
    if (!responseText) {
      throw new Error("Empty response from Ollama");
    }
    
    // JSON formatında değilse, JSON kısmını çıkar
    // Önce markdown code block'ları temizle
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Önce direkt JSON array'i kontrol et
    const directArrayMatch = responseText.match(/^\s*\[[\s\S]*\]\s*$/);
    if (directArrayMatch) {
      return directArrayMatch[0].trim();
    }
    
    // Eğer nested object içinde array varsa çıkar
    const nestedArrayMatch = responseText.match(/\[[\s\S]*\]/);
    if (nestedArrayMatch) {
      return nestedArrayMatch[0];
    }
    
    // Eğer hiç array yoksa, tüm response'u döndür
    return responseText;
  } catch (error: any) {
    console.error("Ollama API error:", error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

export async function generateSummary(jobTitle: string) {
  try {
    const prompt =
      jobTitle && jobTitle !== ""
        ? `Given the job title '${jobTitle}', provide 5-6 different professional summaries with varying experience levels and styles. Include: Senior Professional, Mid-Level Professional, Entry-Level/Fresher, Leadership-Focused, Technical Expert, and General Professional. Each summary should be 3-4 lines long. Return a JSON array with objects containing 'experience_level' and 'summary' fields. Format: [{"experience_level":"Senior Professional","summary":"..."},{"experience_level":"Mid-Level Professional","summary":"..."},...]. Return ONLY valid JSON array, no additional text.`
        : `Create 5-6 different personal summaries for my resume, each with different personality traits and styles. Include: Active/Enthusiastic, Balanced/Professional, Creative/Innovative, Analytical/Detail-Oriented, Collaborative/Team Player, and Ambitious/Goal-Driven. Each summary should be 3-4 lines long, emphasizing personality, social skills, and interests. Return a JSON array with objects containing 'experience_level' and 'summary' fields. Use example hobbies if needed but do not insert placeholders. Return ONLY valid JSON array, no additional text.`;

    const result = await askLlama(prompt);

    if (!result) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsed = JSON.parse(result);
      
      // Eğer direkt array ise
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Eğer tek bir object ise ve gerekli field'ları varsa, array'e çevir
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        if (parsed.activity_level || parsed.description || parsed.experience_level || parsed.summary) {
          return [parsed];
        }
        
        // Eğer nested object içinde array'ler varsa
        const allArrays: any[] = [];
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            allArrays.push(...parsed[key]);
          } else if (typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
            if (parsed[key].activity_level || parsed[key].description || parsed[key].experience_level || parsed[key].summary) {
              allArrays.push(parsed[key]);
            }
          }
        }
        
        if (allArrays.length > 0) {
          const validArrays = allArrays.filter(item => 
            item && typeof item === 'object' && 
            (item.activity_level || item.description || item.experience_level || item.summary)
          );
          if (validArrays.length > 0) {
            return validArrays;
          }
        }
        
        // Son çare: ilk bulunan array'i döndür
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            return parsed[key];
          }
        }
      }
      
      throw new Error("Invalid array format");
    } catch (parseError: any) {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          // Ignore parse error
        }
      }
      throw new Error(`Failed to parse AI response: ${parseError?.message || parseError}`);
    }
  } catch (error: any) {
    console.error("generateSummary error:", error);
    throw error;
  }
}

export async function generateEducationDescription(educationInfo: string) {
  try {
    const prompt = `Based on my education at ${educationInfo}, provide 5-6 different personal descriptions with varying activity levels and styles. Include: High Activity/Excellence, Medium Activity/Good Performance, Low Activity/Basic Participation, Research-Focused, Leadership & Extracurricular, and Academic Achievements. Each description should be 3-4 lines long, written from my perspective, reflecting on past experiences. Include subtle hints about good (but not the best) results. Return a JSON array with objects containing 'activity_level' and 'description' fields. Format: [{"activity_level":"High Activity","description":"..."},...]. Return ONLY valid JSON array, no additional text.`;

    const result = await askLlama(prompt);

    if (!result) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsed = JSON.parse(result);
      
      // Eğer direkt array ise
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Eğer tek bir object ise ve gerekli field'ları varsa, array'e çevir
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        if (parsed.activity_level || parsed.description || parsed.experience_level || parsed.summary) {
          return [parsed];
        }
        
        // Eğer nested object içinde array'ler varsa
        const allArrays: any[] = [];
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            allArrays.push(...parsed[key]);
          } else if (typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
            if (parsed[key].activity_level || parsed[key].description || parsed[key].experience_level || parsed[key].summary) {
              allArrays.push(parsed[key]);
            }
          }
        }
        
        if (allArrays.length > 0) {
          const validArrays = allArrays.filter(item => 
            item && typeof item === 'object' && 
            (item.activity_level || item.description || item.experience_level || item.summary)
          );
          if (validArrays.length > 0) {
            return validArrays;
          }
        }
        
        // Son çare: ilk bulunan array'i döndür
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            return parsed[key];
          }
        }
      }
      
      throw new Error("Invalid array format");
    } catch (parseError: any) {
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          // Ignore parse error
        }
      }
      throw new Error(`Failed to parse AI response: ${parseError?.message || parseError}`);
    }
  } catch (error: any) {
    console.error("generateEducationDescription error:", error);
    throw error;
  }
}

export async function generateExperienceDescription(experienceInfo: string) {
  try {
    const prompt = `Given that I have experience working as ${experienceInfo}, create 5-6 different activity descriptions for my resume with varying levels and styles. Include: High Activity/Leadership, Medium Activity/Collaborative, Low Activity/Supportive, Technical Achievements, Project Management, and Innovation & Problem-Solving. Each description should be 3-4 lines long, written from my perspective, reflecting on my past experiences. Use HTML formatting with <b> for emphasis, <br/> for line breaks, and <ul><li> for lists. Make descriptions professional and impactful. Return a JSON array with objects containing "activity_level" and "description" fields. Format: [{"activity_level":"High Activity","description":"<b>Title</b><br/>Description line 1<br/>Description line 2"},...]. Return ONLY this JSON array, no other text.`;

    const result = await askLlama(prompt);

    if (!result) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsed = JSON.parse(result);
      
      // Eğer direkt array ise
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Eğer tek bir object ise ve activity_level veya description varsa, array'e çevir
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        // Eğer tek bir object ise ve gerekli field'ları varsa
        if (parsed.activity_level || parsed.description || parsed.experience_level || parsed.summary) {
          return [parsed];
        }
        
        // Eğer nested object içinde array'ler varsa (örn: {"high_activity": [...], "medium_activity": [...]})
        const allArrays: any[] = [];
        
        // Tüm array'leri topla ve birleştir
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            allArrays.push(...parsed[key]);
          } else if (typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
            // Eğer nested object içinde object varsa, onu da ekle
            if (parsed[key].activity_level || parsed[key].description || parsed[key].experience_level || parsed[key].summary) {
              allArrays.push(parsed[key]);
            }
          }
        }
        
        // Eğer array'ler bulunduysa ve birleştirilmiş array'de eleman varsa döndür
        if (allArrays.length > 0) {
          // Her elemanın gerekli field'ları olduğundan emin ol
          const validArrays = allArrays.filter(item => 
            item && typeof item === 'object' && 
            (item.activity_level || item.description || item.experience_level || item.summary)
          );
          
          if (validArrays.length > 0) {
            return validArrays;
          }
        }
        
        // Eğer hiç array bulunamadıysa, ilk bulunan array'i döndür
        for (const key in parsed) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            return parsed[key];
          }
        }
      }
      
      throw new Error("Invalid array format");
    } catch (parseError: any) {
      // Eğer parse edilemezse, temizle ve tekrar dene
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          // Ignore parse error
        }
      }
      throw new Error(`Failed to parse AI response: ${parseError?.message || parseError}`);
    }
  } catch (error: any) {
    console.error("generateExperienceDescription error:", error);
    throw error;
  }
}
