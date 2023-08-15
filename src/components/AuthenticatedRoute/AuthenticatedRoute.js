// @ts-nocheck
import Authentication from "../../services/Authentication/Authentication";
import {Route, Navigate} from "react-router-dom";
import React from "react";

/**
 * Represent route that need authenticated
 */
function AuthenticatedRoute({authorization, children}) {
    const isAuthenticated = Authentication.isUserAuthenticated();
    let havePermission = false;

    if (isAuthenticated) {
        const userRole = Authentication.getCurrentUser().roles[0];
        if (authorization != undefined) {
            if (authorization.includes(userRole)) {
                havePermission = true;
            }
        } else {
            havePermission = true;
        }
    }
    return (
        isAuthenticated ? (
            havePermission ? children : <Navigate to="/not_found"/>
        ) : (
            <Navigate to="/auth/signin" />
        )
    )
}

export default AuthenticatedRoute;