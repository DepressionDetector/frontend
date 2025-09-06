const metadataServiceURL = "http://localhost:8080/";

interface SignUpPayload {
  email: string;
  password: string;
}
export async function userSignUpService(userData: SignUpPayload): Promise<any> {
  try {
    const response = await fetch(`${metadataServiceURL}authUser/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || "Signup failed",
      };
    }

    return data;
  } catch (error: any) {
    if (error?.response?.json) {
      try {
        const errorData = await error.response.json();
        return {
          message: errorData.message || "Signup failed",
        };
      } catch {
        // JSON parsing failed
      }
    }
    return {
      message: error.message || "Something went wrong. Please try again later.",
    };
  }
}

interface SignInPayload {
  email: string;
  password: string;
}
export async function userSignInService(userData: SignInPayload): Promise<any> {
  try {
    const response = await fetch(`${metadataServiceURL}authUser/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || "Login failed",
      };
    }

    return data;
  } catch (error: any) {
    console.error("Fetch error in userSignInService:", error);

    return {
      message: "Something went wrong. Please try again later.",
    };
  }
}

interface UpdateNicknamePayload {
  userId: Number;
  nickname: string;
  
}

export async function updateNicknameService(
  payload: UpdateNicknamePayload,
  token: string
): Promise<any> {
  try {
    const response = await fetch(
      `${metadataServiceURL}api/blissme/preferences/nickname`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || "Nickname update failed",
      };
    }

    return data;
  } catch (error: any) {
    return {
      message: error.message || "Something went wrong. Please try again later.",
    };
  }
}

interface UpdateEmailPayload {
  newEmail: string;
}

export async function updateEmailService(
  payload: UpdateEmailPayload,
  token: string
): Promise<any> {
  try {
    const response = await fetch(`${metadataServiceURL}authUser/update-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { message: data.message || "Email update failed" };
    }

    return data;
  } catch (error: any) {
    return {
      message: error.message || "Something went wrong. Please try again later.",
    };
  }
}

interface UpdateCharatorPayload {
  virtualCharacter: Number;
}

export async function updateCharcaterService(
  payload: UpdateCharatorPayload,
  token: string
): Promise<any> {
  try {
    const response = await fetch(`${metadataServiceURL}api/blissme/preferences/character`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { message: data.message || "Email update failed" };
    }

    return data;
  } catch (error: any) {
    return {
      message: error.message || "Something went wrong. Please try again later.",
    };
  }
}
