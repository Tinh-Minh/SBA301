package com.carrental;

import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;

/** Invoke the real Spring bean, including derived repository methods on JDK proxies. */
final class SpySupport {
    private SpySupport() { }

    static Object callRealMethod(InvocationOnMock invocation) throws Throwable {
        return Mockito.mockingDetails(invocation.getMock()).getMockCreationSettings()
                .getDefaultAnswer().answer(invocation);
    }
}
